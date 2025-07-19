"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Profile } from "@/lib/types";

// Validation schemas
const profileCreateSchema = z.object({
  id: z
    .string()
    .min(1, "El ID del usuario es requerido")
    .max(50, "El ID del usuario no puede exceder los 50 caracteres"),
  username: z.string().min(1, "El username es requerido").max(25, "El username no puede exceder los 25 caracteres"),
  email: z.string().email("El email debe tener un formato válido").optional(),
});

const profileUpdateSchema = z.object({
  id: z.string().min(1, "El ID del usuario es requerido"),
  username: z.string().min(1, "El username es requerido").max(25, "El username no puede exceder los 25 caracteres"),
  email: z.string().email("El email debe tener un formato válido").optional(),
});

const profileDeleteSchema = z.object({
  id: z.string().min(1, "El ID del usuario es requerido"),
});

// Database operations
export async function getProfiles(): Promise<Profile[]> {
  const { env } = getRequestContext();
  const profiles = await env.DB.prepare(
    `
    SELECT id, username, email, created_at, updated_at 
    FROM profiles 
    ORDER BY created_at DESC
  `,
  ).all<Profile>();

  return profiles.results || [];
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const { env } = getRequestContext();
  const profile = await env.DB.prepare(
    `
    SELECT id, username, email, created_at, updated_at 
    FROM profiles 
    WHERE id = ?
  `,
  )
    .bind(id)
    .first<Profile>();

  return profile || null;
}

// Server actions
export async function createProfile(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: string;
      username: string;
      email?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear perfiles",
      body: {
        id: formData.get("id") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
      },
    };
  }

  const body = {
    id: formData.get("id") as string,
    username: formData.get("username") as string,
    email: (formData.get("email") as string) || undefined,
  };

  const parsed = profileCreateSchema.safeParse(body);

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
    const existingProfile = await env.DB.prepare(
      `
      SELECT id FROM profiles WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .first();

    if (existingProfile) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe un perfil con ese ID",
        body,
      };
    }

    const existingUsername = await env.DB.prepare(
      `
      SELECT id FROM profiles WHERE username = ?
    `,
    )
      .bind(parsed.data.username)
      .first();

    if (existingUsername) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe un perfil con ese username",
        body,
      };
    }

    if (parsed.data.email) {
      const existingEmail = await env.DB.prepare(
        `
        SELECT id FROM profiles WHERE email = ?
      `,
      )
        .bind(parsed.data.email)
        .first();

      if (existingEmail) {
        return {
          success: 0,
          errors: 1,
          message: "Ya existe un perfil con ese email",
          body,
        };
      }
    }

    await env.DB.prepare(
      `
      INSERT INTO profiles (id, username, email, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    )
      .bind(parsed.data.id, parsed.data.username, parsed.data.email || null)
      .run();

    revalidatePath("/admin/dashboard/profiles");

    return {
      success: 1,
      errors: 0,
      message: `Perfil "${parsed.data.username}" creado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating profile:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear el perfil. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateProfile(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: string;
      username: string;
      email?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar perfiles",
      body: {
        id: formData.get("id") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
      },
    };
  }

  const body = {
    id: formData.get("id") as string,
    username: formData.get("username") as string,
    email: (formData.get("email") as string) || undefined,
  };

  const parsed = profileUpdateSchema.safeParse(body);

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
    const existingProfile = await env.DB.prepare(
      `
      SELECT id FROM profiles WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .first();

    if (!existingProfile) {
      return {
        success: 0,
        errors: 1,
        message: "El perfil no existe",
        body,
      };
    }

    const usernameConflict = await env.DB.prepare(
      `
      SELECT id FROM profiles WHERE username = ? AND id != ?
    `,
    )
      .bind(parsed.data.username, parsed.data.id)
      .first();

    if (usernameConflict) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe otro perfil con ese username",
        body,
      };
    }

    if (parsed.data.email) {
      const emailConflict = await env.DB.prepare(
        `
        SELECT id FROM profiles WHERE email = ? AND id != ?
      `,
      )
        .bind(parsed.data.email, parsed.data.id)
        .first();

      if (emailConflict) {
        return {
          success: 0,
          errors: 1,
          message: "Ya existe otro perfil con ese email",
          body,
        };
      }
    }

    await env.DB.prepare(
      `
      UPDATE profiles 
      SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
      .bind(parsed.data.username, parsed.data.email || null, parsed.data.id)
      .run();

    revalidatePath("/admin/dashboard/profiles");

    return {
      success: 1,
      errors: 0,
      message: `Perfil "${parsed.data.username}" actualizado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar el perfil. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteProfile(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para eliminar perfiles",
      body: {
        id: formData.get("id") as string,
      },
    };
  }

  const body = {
    id: formData.get("id") as string,
  };

  const parsed = profileDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID del perfil inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingProfile = await env.DB.prepare(
      `
      SELECT id, username FROM profiles WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ id: string; username: string }>();

    if (!existingProfile) {
      return {
        success: 0,
        errors: 1,
        message: "El perfil no existe",
        body,
      };
    }

    const isTeamCaptain = await env.DB.prepare(
      `
      SELECT COUNT(*) as count FROM teams WHERE captain_id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ count: number }>();

    const hasPlayerRecord = await env.DB.prepare(
      `
      SELECT COUNT(*) as count FROM players WHERE profile_id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ count: number }>();

    const hasJoinRequests = await env.DB.prepare(
      `
      SELECT COUNT(*) as count FROM join_team_requests WHERE profile_id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ count: number }>();

    if ((isTeamCaptain?.count ?? 0) > 0) {
      return {
        success: 0,
        errors: 1,
        message: "No se puede eliminar el perfil porque es capitán de uno o más equipos",
        body,
      };
    }

    if ((hasPlayerRecord?.count ?? 0) > 0) {
      return {
        success: 0,
        errors: 1,
        message: "No se puede eliminar el perfil porque tiene registros de jugador",
        body,
      };
    }

    if ((hasJoinRequests?.count ?? 0) > 0) {
      return {
        success: 0,
        errors: 1,
        message: "No se puede eliminar el perfil porque tiene solicitudes de equipo",
        body,
      };
    }

    await env.DB.prepare(
      `
      DELETE FROM profiles WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .run();

    revalidatePath("/admin/dashboard/profiles");

    return {
      success: 1,
      errors: 0,
      message: `Perfil "${existingProfile.username}" eliminado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting profile:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar el perfil. Inténtalo de nuevo.",
      body,
    };
  }
}
