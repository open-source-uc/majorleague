"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { TeamPage } from "@/lib/types";

import { getTeamById } from "./teams";

// Validation schemas
const teamPageUpdateSchema = z.object({
  team_id: z.number().min(1, "El ID del equipo es requerido"),
  description: z.string().max(1000, "La descripción no puede exceder los 1000 caracteres").optional(),
  instagram_handle: z
    .string()
    .regex(/^@?[\w.]+$/, "Handle de Instagram inválido")
    .max(50)
    .optional(),
  captain_email: z.string().email("Email inválido").optional(),
  founded_year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  motto: z.string().max(200, "El lema no puede exceder los 200 caracteres").optional(),
  achievements: z.string().optional(), // JSON string
});

const teamPageCreateSchema = z.object({
  team_id: z.number().min(1, "El ID del equipo es requerido"),
  description: z.string().max(1000).optional(),
  instagram_handle: z
    .string()
    .regex(/^@?[\w.]+$/, "Handle de Instagram inválido")
    .max(50)
    .optional(),
  captain_email: z.string().email("Email inválido").optional(),
  founded_year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  motto: z.string().max(200).optional(),
  achievements: z.string().optional(),
});

const addTeamPhotoSchema = z.object({
  team_id: z.number().min(1, "ID del equipo requerido"),
  url: z.string().url("URL inválida"),
  caption: z.string().max(200).optional(),
});

const removeTeamPhotoSchema = z.object({
  photo_id: z.number().min(1, "ID de la foto requerido"),
  team_id: z.number().min(1, "ID del equipo requerido"),
});

// Database operations
export async function getTeamPage(teamId: number): Promise<TeamPage | null> {
  const { env } = getRequestContext();
  const teamPage = await env.DB.prepare(
    `
    SELECT id, team_id, description, instagram_handle, captain_email, 
           founded_year, achievements, motto, created_at, updated_at
    FROM team_pages 
    WHERE team_id = ?
  `,
  )
    .bind(teamId)
    .first<TeamPage>();

  return teamPage || null;
}

export async function getAllTeamPages(): Promise<TeamPage[]> {
  const { env } = getRequestContext();
  const teamPages = await env.DB.prepare(
    `
    SELECT tp.id, tp.team_id, tp.description, tp.instagram_handle, tp.captain_email,
           tp.founded_year, tp.achievements, tp.motto, tp.created_at, tp.updated_at,
           t.name as team_name
    FROM team_pages tp
    LEFT JOIN teams t ON tp.team_id = t.id
    ORDER BY t.name ASC
  `,
  ).all<TeamPage & { team_name?: string }>();

  return teamPages.results || [];
}

// Authorization helper
async function checkTeamEditPermission(teamId: number): Promise<{
  canEdit: boolean;
  isAdmin: boolean;
  message?: string;
}> {
  const { isAdmin, userProfile } = await getAuthStatus();

  if (isAdmin) {
    return { canEdit: true, isAdmin: true };
  }

  if (!userProfile) {
    return { canEdit: false, isAdmin: false, message: "Usuario no autenticado" };
  }

  const team = await getTeamById(teamId);
  if (!team) {
    return { canEdit: false, isAdmin: false, message: "Equipo no encontrado" };
  }

  const isCaptain = userProfile.id === team.captain_id;
  if (!isCaptain) {
    return {
      canEdit: false,
      isAdmin: false,
      message: "Solo el capitán del equipo o un administrador puede editar esta página",
    };
  }

  return { canEdit: true, isAdmin: false };
}

// Server actions
export async function updateTeamPage(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      team_id: number;
      description?: string;
      instagram_handle?: string;
      captain_email?: string;
      founded_year?: number;
      motto?: string;
      achievements?: string;
    };
  },
  formData: FormData,
) {
  const body = {
    team_id: parseInt(formData.get("team_id") as string),
    description: (formData.get("description") as string) || undefined,
    instagram_handle: (formData.get("instagram_handle") as string) || undefined,
    captain_email: (formData.get("captain_email") as string) || undefined,
    founded_year: formData.get("founded_year") ? parseInt(formData.get("founded_year") as string) : undefined,
    motto: (formData.get("motto") as string) || undefined,
    achievements: (formData.get("achievements") as string) || undefined,
  };

  // Authorization check
  const authCheck = await checkTeamEditPermission(body.team_id);
  if (!authCheck.canEdit) {
    return {
      success: 0,
      errors: 1,
      message: authCheck.message || "No tienes permisos para editar esta página",
      body,
    };
  }

  // Validation
  const parsed = teamPageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Revisa los campos e inténtalo de nuevo.",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    // Check if team page exists
    const existingPage = await getTeamPage(parsed.data.team_id);

    if (!existingPage) {
      // Create new team page
      await env.DB.prepare(
        `
        INSERT INTO team_pages (team_id, description, instagram_handle, captain_email, founded_year, motto, achievements, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      )
        .bind(
          parsed.data.team_id,
          parsed.data.description || null,
          parsed.data.instagram_handle || null,
          parsed.data.captain_email || null,
          parsed.data.founded_year || null,
          parsed.data.motto || null,
          parsed.data.achievements || null,
        )
        .run();
    } else {
      // Update existing team page
      await env.DB.prepare(
        `
        UPDATE team_pages 
        SET description = ?, instagram_handle = ?, captain_email = ?, 
            founded_year = ?, motto = ?, achievements = ?, updated_at = CURRENT_TIMESTAMP
        WHERE team_id = ?
      `,
      )
        .bind(
          parsed.data.description || null,
          parsed.data.instagram_handle || null,
          parsed.data.captain_email || null,
          parsed.data.founded_year || null,
          parsed.data.motto || null,
          parsed.data.achievements || null,
          parsed.data.team_id,
        )
        .run();
    }

    // Get team name for success message
    const team = await getTeamById(parsed.data.team_id);
    const teamName = team?.name || "el equipo";

    revalidatePath(`/equipos/${team?.name?.toLowerCase().replace(/\s+/g, "-")}`);
    revalidatePath("/admin/dashboard/teams");

    return {
      success: 1,
      errors: 0,
      message: `Página de ${teamName} actualizada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating team page:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar la página del equipo. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function createTeamPage(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      team_id: number;
      description?: string;
      instagram_handle?: string;
      captain_email?: string;
      founded_year?: number;
      motto?: string;
      achievements?: string;
    };
  },
  formData: FormData,
) {
  const body = {
    team_id: parseInt(formData.get("team_id") as string),
    description: (formData.get("description") as string) || undefined,
    instagram_handle: (formData.get("instagram_handle") as string) || undefined,
    captain_email: (formData.get("captain_email") as string) || undefined,
    founded_year: formData.get("founded_year") ? parseInt(formData.get("founded_year") as string) : undefined,
    motto: (formData.get("motto") as string) || undefined,
    achievements: (formData.get("achievements") as string) || undefined,
  };

  // Authorization check
  const authCheck = await checkTeamEditPermission(body.team_id);
  if (!authCheck.canEdit) {
    return {
      success: 0,
      errors: 1,
      message: authCheck.message || "No tienes permisos para crear esta página",
      body,
    };
  }

  // Validation
  const parsed = teamPageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Revisa los campos e inténtalo de nuevo.",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    // Check if team page already exists
    const existingPage = await getTeamPage(parsed.data.team_id);
    if (existingPage) {
      return {
        success: 0,
        errors: 1,
        message: "La página del equipo ya existe",
        body,
      };
    }

    // Create team page
    await env.DB.prepare(
      `
      INSERT INTO team_pages (team_id, description, instagram_handle, captain_email, founded_year, motto, achievements, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.team_id,
        parsed.data.description || null,
        parsed.data.instagram_handle || null,
        parsed.data.captain_email || null,
        parsed.data.founded_year || null,
        parsed.data.motto || null,
        parsed.data.achievements || null,
      )
      .run();

    // Get team name for success message
    const team = await getTeamById(parsed.data.team_id);
    const teamName = team?.name || "el equipo";

    revalidatePath(`/equipos/${team?.name?.toLowerCase().replace(/\s+/g, "-")}`);
    revalidatePath("/admin/dashboard/teams");

    return {
      success: 1,
      errors: 0,
      message: `Página de ${teamName} creada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating team page:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear la página del equipo. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function addTeamPhoto(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      team_id: number;
      url: string;
      caption?: string;
    };
  },
  formData: FormData,
) {
  const body = {
    team_id: parseInt(formData.get("team_id") as string),
    url: formData.get("url") as string,
    caption: (formData.get("caption") as string) || undefined,
  };

  const parsed = addTeamPhotoSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Datos inválidos",
      body,
    };
  }

  const authCheck = await checkTeamEditPermission(parsed.data.team_id);
  if (!authCheck.canEdit) {
    return {
      success: 0,
      errors: 1,
      message: authCheck.message || "Sin permisos",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const nextOrder = await env.DB.prepare(
      `
      SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
      FROM team_photos
      WHERE team_id = ?
    `,
    )
      .bind(parsed.data.team_id)
      .first<{ next_order: number }>();

    await env.DB.prepare(
      `
      INSERT INTO team_photos (team_id, url, caption, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    )
      .bind(parsed.data.team_id, parsed.data.url, parsed.data.caption || null, nextOrder?.next_order || 1)
      .run();

    const team = await getTeamById(parsed.data.team_id);
    const teamSlug = team?.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    revalidatePath(`/equipos/${teamSlug}`);
    revalidatePath(`/equipos/${teamSlug}/edit`);

    return {
      success: 1,
      errors: 0,
      message: "Foto agregada correctamente",
      body,
    };
  } catch (error) {
    console.error("Error adding team photo:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al agregar la foto. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function removeTeamPhoto(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      photo_id: number;
      team_id: number;
    };
  },
  formData: FormData,
) {
  const body = {
    photo_id: parseInt(formData.get("photo_id") as string),
    team_id: parseInt(formData.get("team_id") as string),
  };

  const parsed = removeTeamPhotoSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Datos inválidos",
      body,
    };
  }

  const authCheck = await checkTeamEditPermission(parsed.data.team_id);
  if (!authCheck.canEdit) {
    return {
      success: 0,
      errors: 1,
      message: authCheck.message || "Sin permisos",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const photo = await env.DB.prepare(
      `
      SELECT id FROM team_photos WHERE id = ? AND team_id = ?
    `,
    )
      .bind(parsed.data.photo_id, parsed.data.team_id)
      .first();

    if (!photo) {
      return {
        success: 0,
        errors: 1,
        message: "Foto no encontrada",
        body,
      };
    }

    await env.DB.prepare(
      `
      DELETE FROM team_photos WHERE id = ?
    `,
    )
      .bind(parsed.data.photo_id)
      .run();

    const team = await getTeamById(parsed.data.team_id);
    const teamSlug = team?.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    revalidatePath(`/equipos/${teamSlug}`);
    revalidatePath(`/equipos/${teamSlug}/edit`);

    return {
      success: 1,
      errors: 0,
      message: "Foto eliminada correctamente",
      body,
    };
  } catch (error) {
    console.error("Error removing team photo:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar la foto. Inténtalo de nuevo.",
      body,
    };
  }
}
