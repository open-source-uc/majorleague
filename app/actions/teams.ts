"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import type { Team } from "@/lib/types";
import { getAuthStatus } from "@/lib/services/auth";

// Validation schemas
const teamCreateSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre del equipo debe tener al menos 2 caracteres")
    .max(50, "El nombre del equipo no puede exceder los 50 caracteres"),
  major: z.string().max(50, "La carrera no puede exceder los 50 caracteres").optional(),
  captain_username: z
    .string()
    .min(1, "El username del capitán es requerido")
    .max(25, "El username del capitán no puede exceder los 25 caracteres"),
});

const teamUpdateSchema = z.object({
  id: z.number().min(1, "El ID del equipo es requerido"),
  name: z
    .string()
    .min(2, "El nombre del equipo debe tener al menos 2 caracteres")
    .max(50, "El nombre del equipo no puede exceder los 50 caracteres"),
  major: z.string().max(50, "La carrera no puede exceder los 50 caracteres").optional(),
  captain_username: z.string().max(25, "El username del capitán no puede exceder los 25 caracteres").optional(),
});

const teamDeleteSchema = z.object({
  id: z.number().min(1, "El ID del equipo es requerido"),
});

// Database operations
export async function getTeams(): Promise<Team[]> {
  const { env } = getRequestContext();
  const teams = await env.DB.prepare(
    `
    SELECT t.id, t.name, t.captain_id, t.major, t.created_at, t.updated_at,
           p.username as captain_username
    FROM teams t
    LEFT JOIN profiles p ON t.captain_id = p.id
    ORDER BY t.created_at DESC
  `,
  ).all<Team>();

  return teams.results || [];
}

export async function getTeamById(id: number): Promise<Team | null> {
  const { env } = getRequestContext();
  const team = await env.DB.prepare(
    `
    SELECT t.id, t.name, t.captain_id, t.major, t.created_at, t.updated_at,
           p.username as captain_username
    FROM teams t
    LEFT JOIN profiles p ON t.captain_id = p.id
    WHERE t.id = ?
  `,
  )
    .bind(id)
    .first<Team>();

  return team || null;
}

// Server actions
export async function createTeam(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      name: string;
      major?: string;
      captain_username: string;
    };
  },
  formData: FormData,
) {
  // Check authentication and admin privileges
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear equipos",
      body: {
        name: formData.get("name") as string,
        major: formData.get("major") as string,
        captain_username: formData.get("captain_username") as string,
      },
    };
  }

  const body = {
    name: formData.get("name") as string,
    major: (formData.get("major") as string) || undefined,
    captain_username: formData.get("captain_username") as string,
  };

  const parsed = teamCreateSchema.safeParse(body);

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
    // Check if team name already exists
    const existingTeam = await env.DB.prepare(
      `
      SELECT id FROM teams WHERE name = ?
    `,
    )
      .bind(parsed.data.name)
      .first();

    if (existingTeam) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe un equipo con ese nombre",
        body,
      };
    }

    // Find captain by username
    const captainUser = await env.DB.prepare(
      `
      SELECT id FROM profiles WHERE username = ?
    `,
    )
      .bind(parsed.data.captain_username)
      .first<{ id: string }>();

    if (!captainUser) {
      return {
        success: 0,
        errors: 1,
        message: `No se encontró un usuario con el username "${parsed.data.captain_username}"`,
        body,
      };
    }

    await env.DB.prepare(
      `
      INSERT INTO teams (name, captain_id, major, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    )
      .bind(parsed.data.name, captainUser.id, parsed.data.major || null)
      .run();

    // Revalidate the teams page
    revalidatePath("/admin/dashboard/teams");

    return {
      success: 1,
      errors: 0,
      message: `Equipo "${parsed.data.name}" creado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating team:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear el equipo. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateTeam(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      name: string;
      major?: string;
      captain_username?: string;
    };
  },
  formData: FormData,
) {
  // Check authentication and admin privileges
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar equipos",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        name: formData.get("name") as string,
        major: formData.get("major") as string,
        captain_username: formData.get("captain_username") as string,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID del equipo inválido",
      body: {
        id: 0,
        name: formData.get("name") as string,
        major: formData.get("major") as string,
        captain_username: formData.get("captain_username") as string,
      },
    };
  }

  const body = {
    id,
    name: formData.get("name") as string,
    major: (formData.get("major") as string) || undefined,
    captain_username: (formData.get("captain_username") as string) || undefined,
  };

  const parsed = teamUpdateSchema.safeParse(body);

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
    // Check if team exists
    const existingTeam = await env.DB.prepare(
      `
      SELECT id FROM teams WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .first();

    if (!existingTeam) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no existe",
        body,
      };
    }

    // Check if new name conflicts with another team
    const nameConflict = await env.DB.prepare(
      `
      SELECT id FROM teams WHERE name = ? AND id != ?
    `,
    )
      .bind(parsed.data.name, parsed.data.id)
      .first();

    if (nameConflict) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe otro equipo con ese nombre",
        body,
      };
    }

    // Determine captain_id if captain_username is provided
    let captainId = null;
    if (parsed.data.captain_username) {
      const captainUser = await env.DB.prepare(
        `
        SELECT id FROM profiles WHERE username = ?
      `,
      )
        .bind(parsed.data.captain_username)
        .first<{ id: string }>();

      if (!captainUser) {
        return {
          success: 0,
          errors: 1,
          message: `No se encontró un usuario con el username "${parsed.data.captain_username}"`,
          body,
        };
      }
      captainId = captainUser.id;
    }

    // Update team
    if (captainId) {
      await env.DB.prepare(
        `
        UPDATE teams 
        SET name = ?, major = ?, captain_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      )
        .bind(parsed.data.name, parsed.data.major || null, captainId, parsed.data.id)
        .run();
    } else {
      await env.DB.prepare(
        `
        UPDATE teams 
        SET name = ?, major = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      )
        .bind(parsed.data.name, parsed.data.major || null, parsed.data.id)
        .run();
    }

    // Revalidate the teams page
    revalidatePath("/admin/dashboard/teams");

    return {
      success: 1,
      errors: 0,
      message: `Equipo "${parsed.data.name}" actualizado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating team:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar el equipo. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteTeam(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
    };
  },
  formData: FormData,
) {
  // Check authentication and admin privileges
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para eliminar equipos",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID del equipo inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = teamDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID del equipo inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    // Check if team exists
    const existingTeam = await env.DB.prepare(
      `
      SELECT id, name FROM teams WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ id: number; name: string }>();

    if (!existingTeam) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no existe",
        body,
      };
    }

    // Check if team has related records (players, matches, etc.)
    const hasPlayers = await env.DB.prepare(
      `
      SELECT COUNT(*) as count FROM players WHERE team_id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ count: number }>();

    const hasMatches = await env.DB.prepare(
      `
      SELECT COUNT(*) as count FROM matches 
      WHERE local_team_id = ? OR visitor_team_id = ?
    `,
    )
      .bind(parsed.data.id, parsed.data.id)
      .first<{ count: number }>();

    if ((hasPlayers?.count ?? 0) > 0 || (hasMatches?.count ?? 0) > 0) {
      return {
        success: 0,
        errors: 1,
        message: "No se puede eliminar el equipo porque tiene jugadores o partidos asociados",
        body,
      };
    }

    // Delete team
    await env.DB.prepare(
      `
      DELETE FROM teams WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .run();

    // Revalidate the teams page
    revalidatePath("/admin/dashboard/teams");

    return {
      success: 1,
      errors: 0,
      message: `Equipo "${existingTeam.name}" eliminado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting team:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar el equipo. Inténtalo de nuevo.",
      body,
    };
  }
}
