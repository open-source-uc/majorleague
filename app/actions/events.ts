"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Event } from "@/lib/types";

// Validation schemas
const eventCreateSchema = z.object({
  match_id: z.number().min(1, "El ID del partido es requerido"),
  team_id: z.number().min(1, "El ID del equipo es requerido"),
  type: z.enum(["goal", "yellow_card", "red_card", "substitution", "other"]),
  minute: z.number().min(0, "El minuto debe ser 0 o mayor").max(120, "El minuto no puede ser mayor a 120"),
  description: z.string().max(255, "La descripción no puede tener más de 255 caracteres").optional(),
});

const eventUpdateSchema = z.object({
  id: z.number().min(1, "El ID del evento es requerido"),
  match_id: z.number().min(1, "El ID del partido es requerido"),
  team_id: z.number().min(1, "El ID del equipo es requerido"),
  type: z.enum(["goal", "yellow_card", "red_card", "substitution", "other"]),
  minute: z.number().min(0, "El minuto debe ser 0 o mayor").max(120, "El minuto no puede ser mayor a 120"),
  description: z.string().max(255, "La descripción no puede tener más de 255 caracteres").optional(),
});

const eventDeleteSchema = z.object({
  id: z.number().min(1, "El ID del evento es requerido"),
});

// Database operations
export async function getEvents(): Promise<Event[]> {
  const { env } = getRequestContext();
  const events = await env.DB.prepare(
    `
    SELECT e.id, e.match_id, e.team_id, e.type, e.minute, e.description, e.created_at,
           m.timestamp as match_date, t.name as team_name,
           lt.name as local_team_name, vt.name as visitor_team_name,
           (lt.name || ' vs ' || vt.name || ' - ' || m.timestamp) as match_description
    FROM events e
    LEFT JOIN matches m ON e.match_id = m.id
    LEFT JOIN teams t ON e.team_id = t.id
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    ORDER BY e.created_at DESC
  `,
  ).all<
    Event & {
      match_date?: string;
      team_name?: string;
      local_team_name?: string;
      visitor_team_name?: string;
      match_description?: string;
    }
  >();

  return events.results || [];
}

export async function getEventById(id: number): Promise<Event | null> {
  const { env } = getRequestContext();
  const event = await env.DB.prepare(
    `
    SELECT e.id, e.match_id, e.team_id, e.type, e.minute, e.description, e.created_at,
           m.timestamp as match_date, t.name as team_name,
           lt.name as local_team_name, vt.name as visitor_team_name
    FROM events e
    LEFT JOIN matches m ON e.match_id = m.id
    LEFT JOIN teams t ON e.team_id = t.id
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    WHERE e.id = ?
  `,
  )
    .bind(id)
    .first<Event>();

  return event || null;
}

// Server actions
export async function createEvent(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      match_id: number;
      team_id: number;
      type: string;
      minute: number;
      description?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear eventos",
      body: {
        match_id: parseInt(formData.get("match_id") as string) || 0,
        team_id: parseInt(formData.get("team_id") as string) || 0,
        type: formData.get("type") as string,
        minute: parseInt(formData.get("minute") as string) || 0,
        description: formData.get("description") as string,
      },
    };
  }

  const body = {
    match_id: parseInt(formData.get("match_id") as string) || 0,
    team_id: parseInt(formData.get("team_id") as string) || 0,
    type: formData.get("type") as string,
    minute: parseInt(formData.get("minute") as string) || 0,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = eventCreateSchema.safeParse(body);

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
    const match = await env.DB.prepare(`SELECT id, local_team_id, visitor_team_id, status FROM matches WHERE id = ?`)
      .bind(parsed.data.match_id)
      .first<{ id: number; local_team_id: number; visitor_team_id: number; status: string }>();

    if (!match) {
      return {
        success: 0,
        errors: 1,
        message: "El partido no existe",
        body,
      };
    }

    if (match.status !== "live" && match.status !== "in review") {
      return {
        success: 0,
        errors: 1,
        message: "Los eventos solo se pueden registrar en partidos 'en vivo' o 'en revisión'",
        body,
      };
    }

    const team = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.team_id).first();

    if (!team) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no existe",
        body,
      };
    }

    if (parsed.data.team_id !== match.local_team_id && parsed.data.team_id !== match.visitor_team_id) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no participa en este partido",
        body,
      };
    }

    await env.DB.prepare(
      `
      INSERT INTO events (match_id, team_id, type, minute, description, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.match_id,
        parsed.data.team_id,
        parsed.data.type,
        parsed.data.minute,
        parsed.data.description || null,
      )
      .run();

    revalidatePath("/admin/dashboard/events");

    return {
      success: 1,
      errors: 0,
      message: `Evento "${parsed.data.type}" creado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear el evento. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateEvent(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      match_id: number;
      team_id: number;
      type: string;
      minute: number;
      description?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar eventos",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        match_id: parseInt(formData.get("match_id") as string) || 0,
        team_id: parseInt(formData.get("team_id") as string) || 0,
        type: formData.get("type") as string,
        minute: parseInt(formData.get("minute") as string) || 0,
        description: formData.get("description") as string,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID del evento inválido",
      body: {
        id: 0,
        match_id: parseInt(formData.get("match_id") as string) || 0,
        team_id: parseInt(formData.get("team_id") as string) || 0,
        type: formData.get("type") as string,
        minute: parseInt(formData.get("minute") as string) || 0,
        description: formData.get("description") as string,
      },
    };
  }

  const body = {
    id,
    match_id: parseInt(formData.get("match_id") as string) || 0,
    team_id: parseInt(formData.get("team_id") as string) || 0,
    type: formData.get("type") as string,
    minute: parseInt(formData.get("minute") as string) || 0,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = eventUpdateSchema.safeParse(body);

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
    const existingEvent = await env.DB.prepare(`SELECT id FROM events WHERE id = ?`).bind(parsed.data.id).first();

    if (!existingEvent) {
      return {
        success: 0,
        errors: 1,
        message: "El evento no existe",
        body,
      };
    }

    const match = await env.DB.prepare(`SELECT id, local_team_id, visitor_team_id, status FROM matches WHERE id = ?`)
      .bind(parsed.data.match_id)
      .first<{ id: number; local_team_id: number; visitor_team_id: number; status: string }>();

    if (!match) {
      return {
        success: 0,
        errors: 1,
        message: "El partido no existe",
        body,
      };
    }

    if (match.status !== "live" && match.status !== "in review") {
      return {
        success: 0,
        errors: 1,
        message: "Los eventos solo se pueden modificar en partidos 'en vivo' o 'en revisión'",
        body,
      };
    }

    const team = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.team_id).first();

    if (!team) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no existe",
        body,
      };
    }

    if (parsed.data.team_id !== match.local_team_id && parsed.data.team_id !== match.visitor_team_id) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no participa en este partido",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE events 
      SET match_id = ?, team_id = ?, type = ?, minute = ?, description = ?
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.match_id,
        parsed.data.team_id,
        parsed.data.type,
        parsed.data.minute,
        parsed.data.description || null,
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/events");

    return {
      success: 1,
      errors: 0,
      message: `Evento "${parsed.data.type}" actualizado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar el evento. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteEvent(
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
      message: "No tienes permisos para eliminar eventos",
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
      message: "ID del evento inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = eventDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID del evento inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingEvent = await env.DB.prepare(`SELECT e.id, e.type, e.match_id FROM events e WHERE e.id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number; type: string; match_id: number }>();

    if (!existingEvent) {
      return {
        success: 0,
        errors: 1,
        message: "El evento no existe",
        body,
      };
    }

    const match = await env.DB.prepare(`SELECT id, status FROM matches WHERE id = ?`)
      .bind(existingEvent.match_id)
      .first<{ id: number; status: string }>();

    if (!match) {
      return {
        success: 0,
        errors: 1,
        message: "El partido asociado no existe",
        body,
      };
    }

    if (match.status !== "live" && match.status !== "in review") {
      return {
        success: 0,
        errors: 1,
        message: "Los eventos solo se pueden eliminar en partidos 'en vivo' o 'en revisión'",
        body,
      };
    }

    const hasEventPlayers = await env.DB.prepare(`SELECT COUNT(*) as count FROM event_players WHERE event_id = ?`)
      .bind(parsed.data.id)
      .first<{ count: number }>();

    if ((hasEventPlayers?.count ?? 0) > 0) {
      return {
        success: 0,
        errors: 1,
        message: "No se puede eliminar el evento porque tiene jugadores asociados",
        body,
      };
    }

    await env.DB.prepare(`DELETE FROM events WHERE id = ?`).bind(parsed.data.id).run();

    revalidatePath("/admin/dashboard/events");

    return {
      success: 1,
      errors: 0,
      message: `Evento "${existingEvent.type}" eliminado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar el evento. Inténtalo de nuevo.",
      body,
    };
  }
}
