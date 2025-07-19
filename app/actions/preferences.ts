"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Preference } from "@/lib/types";

// Validation schemas
const preferenceCreateSchema = z.object({
  profile_id: z.string().min(1, "El ID del perfil es requerido"),
  type: z.enum(["notification", "privacy", "display"]),
  channel: z.string().min(1, "El canal es requerido"),
  lead_time_minutes: z.number().min(0, "El tiempo de anticipación debe ser 0 o mayor"),
  is_enabled: z.boolean(),
});

const preferenceUpdateSchema = z.object({
  id: z.number().min(1, "El ID de la preferencia es requerido"),
  profile_id: z.string().min(1, "El ID del perfil es requerido"),
  type: z.enum(["notification", "privacy", "display"]),
  channel: z.string().min(1, "El canal es requerido"),
  lead_time_minutes: z.number().min(0, "El tiempo de anticipación debe ser 0 o mayor"),
  is_enabled: z.boolean(),
});

const preferenceDeleteSchema = z.object({
  id: z.number().min(1, "El ID de la preferencia es requerido"),
});

// Database operations
export async function getPreferences(): Promise<Preference[]> {
  const { env } = getRequestContext();
  const preferences = await env.DB.prepare(
    `
    SELECT pr.id, pr.profile_id, pr.type, pr.channel, pr.lead_time_minutes, pr.is_enabled, pr.created_at, pr.updated_at,
           p.username as profile_username
    FROM preferences pr
    LEFT JOIN profiles p ON pr.profile_id = p.id
    ORDER BY pr.created_at DESC
  `,
  ).all<Preference & { profile_username?: string }>();

  return preferences.results || [];
}

export async function getPreferenceById(id: number): Promise<Preference | null> {
  const { env } = getRequestContext();
  const preference = await env.DB.prepare(
    `
    SELECT pr.id, pr.profile_id, pr.type, pr.channel, pr.lead_time_minutes, pr.is_enabled, pr.created_at, pr.updated_at,
           p.username as profile_username
    FROM preferences pr
    LEFT JOIN profiles p ON pr.profile_id = p.id
    WHERE pr.id = ?
  `,
  )
    .bind(id)
    .first<Preference>();

  return preference || null;
}

// Server actions
export async function createPreference(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      profile_id: string;
      type: string;
      channel: string;
      lead_time_minutes: number;
      is_enabled: boolean;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear preferencias",
      body: {
        profile_id: formData.get("profile_id") as string,
        type: formData.get("type") as string,
        channel: formData.get("channel") as string,
        lead_time_minutes: parseInt(formData.get("lead_time_minutes") as string) || 0,
        is_enabled: formData.get("is_enabled") === "true",
      },
    };
  }

  const body = {
    profile_id: formData.get("profile_id") as string,
    type: formData.get("type") as string,
    channel: formData.get("channel") as string,
    lead_time_minutes: parseInt(formData.get("lead_time_minutes") as string) || 0,
    is_enabled: formData.get("is_enabled") === "true",
  };

  const parsed = preferenceCreateSchema.safeParse(body);

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
    const profile = await env.DB.prepare(`SELECT id FROM profiles WHERE id = ?`).bind(parsed.data.profile_id).first();

    if (!profile) {
      return {
        success: 0,
        errors: 1,
        message: "El perfil no existe",
        body,
      };
    }

    const existingPreference = await env.DB.prepare(
      `SELECT id FROM preferences WHERE profile_id = ? AND type = ? AND channel = ?`,
    )
      .bind(parsed.data.profile_id, parsed.data.type, parsed.data.channel)
      .first();

    if (existingPreference) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe una preferencia para este perfil, tipo y canal",
        body,
      };
    }

    await env.DB.prepare(
      `
      INSERT INTO preferences (profile_id, type, channel, lead_time_minutes, is_enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.profile_id,
        parsed.data.type,
        parsed.data.channel,
        parsed.data.lead_time_minutes,
        parsed.data.is_enabled,
      )
      .run();

    revalidatePath("/admin/dashboard/preferences");

    return {
      success: 1,
      errors: 0,
      message: `Preferencia creada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating preference:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear la preferencia. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updatePreference(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      profile_id: string;
      type: string;
      channel: string;
      lead_time_minutes: number;
      is_enabled: boolean;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar preferencias",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        profile_id: formData.get("profile_id") as string,
        type: formData.get("type") as string,
        channel: formData.get("channel") as string,
        lead_time_minutes: parseInt(formData.get("lead_time_minutes") as string) || 0,
        is_enabled: formData.get("is_enabled") === "true",
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la preferencia inválido",
      body: {
        id: 0,
        profile_id: formData.get("profile_id") as string,
        type: formData.get("type") as string,
        channel: formData.get("channel") as string,
        lead_time_minutes: parseInt(formData.get("lead_time_minutes") as string) || 0,
        is_enabled: formData.get("is_enabled") === "true",
      },
    };
  }

  const body = {
    id,
    profile_id: formData.get("profile_id") as string,
    type: formData.get("type") as string,
    channel: formData.get("channel") as string,
    lead_time_minutes: parseInt(formData.get("lead_time_minutes") as string) || 0,
    is_enabled: formData.get("is_enabled") === "true",
  };

  const parsed = preferenceUpdateSchema.safeParse(body);

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
    const existingPreference = await env.DB.prepare(`SELECT id FROM preferences WHERE id = ?`)
      .bind(parsed.data.id)
      .first();

    if (!existingPreference) {
      return {
        success: 0,
        errors: 1,
        message: "La preferencia no existe",
        body,
      };
    }

    const duplicatePreference = await env.DB.prepare(
      `SELECT id FROM preferences WHERE profile_id = ? AND type = ? AND channel = ? AND id != ?`,
    )
      .bind(parsed.data.profile_id, parsed.data.type, parsed.data.channel, parsed.data.id)
      .first();

    if (duplicatePreference) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe otra preferencia para este perfil, tipo y canal",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE preferences 
      SET profile_id = ?, type = ?, channel = ?, lead_time_minutes = ?, is_enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.profile_id,
        parsed.data.type,
        parsed.data.channel,
        parsed.data.lead_time_minutes,
        parsed.data.is_enabled,
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/preferences");

    return {
      success: 1,
      errors: 0,
      message: `Preferencia actualizada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating preference:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar la preferencia. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deletePreference(
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
      message: "No tienes permisos para eliminar preferencias",
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
      message: "ID de la preferencia inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = preferenceDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la preferencia inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingPreference = await env.DB.prepare(`SELECT id FROM preferences WHERE id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number }>();

    if (!existingPreference) {
      return {
        success: 0,
        errors: 1,
        message: "La preferencia no existe",
        body,
      };
    }

    await env.DB.prepare(`DELETE FROM preferences WHERE id = ?`).bind(parsed.data.id).run();

    revalidatePath("/admin/dashboard/preferences");

    return {
      success: 1,
      errors: 0,
      message: `Preferencia eliminada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting preference:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar la preferencia. Inténtalo de nuevo.",
      body,
    };
  }
}
