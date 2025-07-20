"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Stream } from "@/lib/types";

// Validation schemas
const streamCreateSchema = z.object({
  match_id: z.number().min(1, "El ID del partido es requerido"),
  type: z.enum(["youtube", "twitch", "other"]),
  platform: z.string().min(1, "La plataforma es requerida").max(50, "La plataforma no puede exceder los 50 caracteres"),
  url: z.string().url("Debe ser una URL válida"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
});

const streamUpdateSchema = z.object({
  id: z.number().min(1, "El ID del stream es requerido"),
  match_id: z.number().min(1, "El ID del partido es requerido"),
  type: z.enum(["youtube", "twitch", "other"]),
  platform: z.string().min(1, "La plataforma es requerida").max(50, "La plataforma no puede exceder los 50 caracteres"),
  url: z.string().url("Debe ser una URL válida"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
});

const streamDeleteSchema = z.object({
  id: z.number().min(1, "El ID del stream es requerido"),
});

// Database operations
export async function getStreams(): Promise<Stream[]> {
  const { env } = getRequestContext();
  const streams = await env.DB.prepare(
    `
    SELECT s.id, s.match_id, s.type, s.platform, s.url, s.start_time, s.end_time, s.notes, s.created_at,
           m.date as match_date, lt.name as local_team_name, vt.name as visitor_team_name,
           (lt.name || ' vs ' || vt.name || ' - ' || m.date) as match_description
    FROM streams s
    LEFT JOIN matches m ON s.match_id = m.id
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    ORDER BY s.created_at DESC
  `,
  ).all<
    Stream & { match_date?: string; local_team_name?: string; visitor_team_name?: string; match_description?: string }
  >();

  return streams.results || [];
}

export async function getStreamById(id: number): Promise<Stream | null> {
  const { env } = getRequestContext();
  const stream = await env.DB.prepare(
    `
    SELECT s.id, s.match_id, s.type, s.platform, s.url, s.start_time, s.end_time, s.notes, s.created_at,
           m.date as match_date, lt.name as local_team_name, vt.name as visitor_team_name
    FROM streams s
    LEFT JOIN matches m ON s.match_id = m.id
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    WHERE s.id = ?
  `,
  )
    .bind(id)
    .first<Stream>();

  return stream || null;
}

// Server actions
export async function createStream(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      match_id: number;
      type: string;
      platform: string;
      url: string;
      start_time?: string;
      end_time?: string;
      notes?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear streams",
      body: {
        match_id: parseInt(formData.get("match_id") as string) || 0,
        type: formData.get("type") as string,
        platform: formData.get("platform") as string,
        url: formData.get("url") as string,
        start_time: formData.get("start_time") as string,
        end_time: formData.get("end_time") as string,
        notes: formData.get("notes") as string,
      },
    };
  }

  // Helper function to convert datetime-local format to database format
  const convertDateTimeLocal = (datetimeLocal: string) => {
    if (!datetimeLocal) return undefined;
    // Convert from "YYYY-MM-DDTHH:MM" to "YYYY-MM-DD HH:MM:SS"
    return datetimeLocal.replace("T", " ") + ":00";
  };

  const body = {
    match_id: parseInt(formData.get("match_id") as string) || 0,
    type: formData.get("type") as string,
    platform: formData.get("platform") as string,
    url: formData.get("url") as string,
    start_time: convertDateTimeLocal(formData.get("start_time") as string),
    end_time: convertDateTimeLocal(formData.get("end_time") as string),
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = streamCreateSchema.safeParse(body);

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
    const match = await env.DB.prepare(`SELECT id FROM matches WHERE id = ?`).bind(parsed.data.match_id).first();

    if (!match) {
      return {
        success: 0,
        errors: 1,
        message: "El partido no existe",
        body,
      };
    }

    if (parsed.data.start_time && parsed.data.end_time) {
      const startTime = new Date(parsed.data.start_time);
      const endTime = new Date(parsed.data.end_time);

      if (startTime >= endTime) {
        return {
          success: 0,
          errors: 1,
          message: "La hora de inicio debe ser anterior a la hora de fin",
          body,
        };
      }
    }

    await env.DB.prepare(
      `
      INSERT INTO streams (match_id, type, platform, url, start_time, end_time, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.match_id,
        parsed.data.type,
        parsed.data.platform,
        parsed.data.url,
        parsed.data.start_time || null,
        parsed.data.end_time || null,
        parsed.data.notes || null,
      )
      .run();

    revalidatePath("/admin/dashboard/streams");

    return {
      success: 1,
      errors: 0,
      message: `Stream creado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating stream:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear el stream. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateStream(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      match_id: number;
      type: string;
      platform: string;
      url: string;
      start_time?: string;
      end_time?: string;
      notes?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar streams",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        match_id: parseInt(formData.get("match_id") as string) || 0,
        type: formData.get("type") as string,
        platform: formData.get("platform") as string,
        url: formData.get("url") as string,
        start_time: formData.get("start_time") as string,
        end_time: formData.get("end_time") as string,
        notes: formData.get("notes") as string,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID del stream inválido",
      body: {
        id: 0,
        match_id: parseInt(formData.get("match_id") as string) || 0,
        type: formData.get("type") as string,
        platform: formData.get("platform") as string,
        url: formData.get("url") as string,
        start_time: formData.get("start_time") as string,
        end_time: formData.get("end_time") as string,
        notes: formData.get("notes") as string,
      },
    };
  }

  // Helper function to convert datetime-local format to database format
  const convertDateTimeLocal = (datetimeLocal: string) => {
    if (!datetimeLocal) return undefined;
    // Convert from "YYYY-MM-DDTHH:MM" to "YYYY-MM-DD HH:MM:SS"
    return datetimeLocal.replace("T", " ") + ":00";
  };

  const body = {
    id,
    match_id: parseInt(formData.get("match_id") as string) || 0,
    type: formData.get("type") as string,
    platform: formData.get("platform") as string,
    url: formData.get("url") as string,
    start_time: convertDateTimeLocal(formData.get("start_time") as string),
    end_time: convertDateTimeLocal(formData.get("end_time") as string),
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = streamUpdateSchema.safeParse(body);

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
    const existingStream = await env.DB.prepare(`SELECT id FROM streams WHERE id = ?`).bind(parsed.data.id).first();

    if (!existingStream) {
      return {
        success: 0,
        errors: 1,
        message: "El stream no existe",
        body,
      };
    }

    const match = await env.DB.prepare(`SELECT id FROM matches WHERE id = ?`).bind(parsed.data.match_id).first();

    if (!match) {
      return {
        success: 0,
        errors: 1,
        message: "El partido no existe",
        body,
      };
    }

    if (parsed.data.start_time && parsed.data.end_time) {
      const startTime = new Date(parsed.data.start_time);
      const endTime = new Date(parsed.data.end_time);

      if (startTime >= endTime) {
        return {
          success: 0,
          errors: 1,
          message: "La hora de inicio debe ser anterior a la hora de fin",
          body,
        };
      }
    }

    await env.DB.prepare(
      `
      UPDATE streams 
      SET match_id = ?, type = ?, platform = ?, url = ?, start_time = ?, end_time = ?, notes = ?
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.match_id,
        parsed.data.type,
        parsed.data.platform,
        parsed.data.url,
        parsed.data.start_time || null,
        parsed.data.end_time || null,
        parsed.data.notes || null,
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/streams");

    return {
      success: 1,
      errors: 0,
      message: `Stream actualizado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating stream:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar el stream. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteStream(
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
      message: "No tienes permisos para eliminar streams",
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
      message: "ID del stream inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = streamDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID del stream inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingStream = await env.DB.prepare(`SELECT id, platform FROM streams WHERE id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number; platform: string }>();

    if (!existingStream) {
      return {
        success: 0,
        errors: 1,
        message: "El stream no existe",
        body,
      };
    }

    await env.DB.prepare(`DELETE FROM streams WHERE id = ?`).bind(parsed.data.id).run();

    revalidatePath("/admin/dashboard/streams");

    return {
      success: 1,
      errors: 0,
      message: `Stream eliminado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting stream:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar el stream. Inténtalo de nuevo.",
      body,
    };
  }
}
