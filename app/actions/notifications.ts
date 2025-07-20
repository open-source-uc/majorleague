"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Notification } from "@/lib/types";

// Validation schemas
const notificationCreateSchema = z.object({
  profile_id: z.string().min(1, "El ID del perfil es requerido"),
  match_id: z.number().min(1, "El ID del partido es requerido").optional(),
  preference_id: z.number().min(1, "El ID de la preferencia es requerido").optional(),
  is_enabled: z.boolean(),
  status: z.enum(["pending", "sent", "failed"]).optional(),
});

const notificationUpdateSchema = z.object({
  id: z.number().min(1, "El ID de la notificación es requerido"),
  profile_id: z.string().min(1, "El ID del perfil es requerido"),
  match_id: z.number().min(1, "El ID del partido es requerido").optional(),
  preference_id: z.number().min(1, "El ID de la preferencia es requerido").optional(),
  is_enabled: z.boolean(),
  status: z.enum(["pending", "sent", "failed"]).optional(),
});

const notificationDeleteSchema = z.object({
  id: z.number().min(1, "El ID de la notificación es requerido"),
});

// Database operations
export async function getNotifications(): Promise<Notification[]> {
  const { env } = getRequestContext();
  const notifications = await env.DB.prepare(
    `
    SELECT n.id, n.profile_id, n.match_id, n.preference_id, n.sent_at, n.is_enabled, n.status, n.delivery_info, n.created_at,
           p.username as profile_username,
           CASE 
             WHEN m.id IS NOT NULL THEN (lt.name || ' vs ' || vt.name || ' - ' || m.date)
             ELSE NULL
           END as match_description
    FROM notifications n
    LEFT JOIN profiles p ON n.profile_id = p.id
    LEFT JOIN matches m ON n.match_id = m.id
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    ORDER BY n.created_at DESC
  `,
  ).all<Notification & { profile_username?: string; match_description?: string }>();

  return notifications.results || [];
}

export async function getNotificationById(id: number): Promise<Notification | null> {
  const { env } = getRequestContext();
  const notification = await env.DB.prepare(
    `
    SELECT n.id, n.profile_id, n.match_id, n.preference_id, n.sent_at, n.is_enabled, n.status, n.delivery_info, n.created_at,
           p.username as profile_username
    FROM notifications n
    LEFT JOIN profiles p ON n.profile_id = p.id
    WHERE n.id = ?
  `,
  )
    .bind(id)
    .first<Notification>();

  return notification || null;
}

// Server actions
export async function createNotification(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      profile_id: string;
      match_id?: number;
      preference_id?: number;
      is_enabled: boolean;
      status?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear notificaciones",
      body: {
        profile_id: formData.get("profile_id") as string,
        match_id: parseInt(formData.get("match_id") as string) || undefined,
        preference_id: parseInt(formData.get("preference_id") as string) || undefined,
        is_enabled: formData.get("is_enabled") === "true",
        status: formData.get("status") as string,
      },
    };
  }

  const body = {
    profile_id: formData.get("profile_id") as string,
    match_id: parseInt(formData.get("match_id") as string) || undefined,
    preference_id: parseInt(formData.get("preference_id") as string) || undefined,
    is_enabled: formData.get("is_enabled") === "true",
    status: (formData.get("status") as string) || "pending",
  };

  const parsed = notificationCreateSchema.safeParse(body);

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

    await env.DB.prepare(
      `
      INSERT INTO notifications (profile_id, match_id, preference_id, is_enabled, status, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.profile_id,
        parsed.data.match_id || null,
        parsed.data.preference_id || null,
        parsed.data.is_enabled,
        parsed.data.status || "pending",
      )
      .run();

    revalidatePath("/admin/dashboard/notifications");

    return {
      success: 1,
      errors: 0,
      message: `Notificación creada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear la notificación. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateNotification(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      profile_id: string;
      match_id?: number;
      preference_id?: number;
      is_enabled: boolean;
      status?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar notificaciones",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        profile_id: formData.get("profile_id") as string,
        match_id: parseInt(formData.get("match_id") as string) || undefined,
        preference_id: parseInt(formData.get("preference_id") as string) || undefined,
        is_enabled: formData.get("is_enabled") === "true",
        status: formData.get("status") as string,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la notificación inválido",
      body: {
        id: 0,
        profile_id: formData.get("profile_id") as string,
        match_id: parseInt(formData.get("match_id") as string) || undefined,
        preference_id: parseInt(formData.get("preference_id") as string) || undefined,
        is_enabled: formData.get("is_enabled") === "true",
        status: formData.get("status") as string,
      },
    };
  }

  const body = {
    id,
    profile_id: formData.get("profile_id") as string,
    match_id: parseInt(formData.get("match_id") as string) || undefined,
    preference_id: parseInt(formData.get("preference_id") as string) || undefined,
    is_enabled: formData.get("is_enabled") === "true",
    status: (formData.get("status") as string) || "pending",
  };

  const parsed = notificationUpdateSchema.safeParse(body);

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
    const existingNotification = await env.DB.prepare(`SELECT id FROM notifications WHERE id = ?`)
      .bind(parsed.data.id)
      .first();

    if (!existingNotification) {
      return {
        success: 0,
        errors: 1,
        message: "La notificación no existe",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE notifications 
      SET profile_id = ?, match_id = ?, preference_id = ?, is_enabled = ?, status = ?
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.profile_id,
        parsed.data.match_id || null,
        parsed.data.preference_id || null,
        parsed.data.is_enabled,
        parsed.data.status || "pending",
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/notifications");

    return {
      success: 1,
      errors: 0,
      message: `Notificación actualizada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating notification:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar la notificación. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteNotification(
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
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para eliminar notificaciones",
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
      message: "ID de la notificación inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = notificationDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la notificación inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingNotification = await env.DB.prepare(`SELECT id FROM notifications WHERE id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number }>();

    if (!existingNotification) {
      return {
        success: 0,
        errors: 1,
        message: "La notificación no existe",
        body,
      };
    }

    await env.DB.prepare(`DELETE FROM notifications WHERE id = ?`).bind(parsed.data.id).run();

    revalidatePath("/admin/dashboard/notifications");

    return {
      success: 1,
      errors: 0,
      message: `Notificación eliminada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar la notificación. Inténtalo de nuevo.",
      body,
    };
  }
}
