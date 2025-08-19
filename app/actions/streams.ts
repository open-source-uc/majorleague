"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Stream } from "@/lib/types";
import { extractYouTubeVideoId, fetchYouTubeOEmbedByUrl } from "@/lib/utils/youtube";

// Validation schemas (YouTube-only, date-based)
const streamCreateSchema = z.object({
  stream_date: z.string().min(1, "La fecha de transmisión es requerida"),
  youtube_url: z.string().url("Debe ser una URL válida"),
  title: z.string().min(1, "El título es requerido"),
  is_live_stream: z.enum(["true", "false"]).optional(),
  is_featured: z.enum(["true", "false"]).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
});

const streamUpdateSchema = z.object({
  id: z.number().min(1, "El ID del stream es requerido"),
  stream_date: z.string().min(1, "La fecha de transmisión es requerida"),
  youtube_url: z.string().url("Debe ser una URL válida"),
  title: z.string().min(1, "El título es requerido"),
  is_live_stream: z.enum(["true", "false"]).optional(),
  is_featured: z.enum(["true", "false"]).optional(),
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
    SELECT 
      s.id, s.stream_date, s.url, s.youtube_video_id, s.is_live_stream, s.is_featured, s.title, s.thumbnail_url, s.published_at, s.duration_seconds, s.start_time, s.end_time, s.notes, s.created_at,
      s.url as youtube_url
    FROM streams s
    ORDER BY COALESCE(s.start_time, s.stream_date, s.created_at) DESC
  `,
  ).all<
    (Stream & { youtube_url?: string })
  >();

  return streams.results || [];
}

export async function getStreamById(id: number): Promise<Stream | null> {
  const { env } = getRequestContext();
  const stream = await env.DB.prepare(
    `
    SELECT s.id, s.stream_date, s.url, s.youtube_video_id, s.is_live_stream, s.is_featured, s.title, s.thumbnail_url, s.published_at, s.duration_seconds, s.start_time, s.end_time, s.notes, s.created_at,
           s.url as youtube_url
    FROM streams s
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
      stream_date: string;
      youtube_url: string;
      title: string;
      is_live_stream?: string;
      is_featured?: string;
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
        stream_date: (formData.get("stream_date") as string) || "",
        youtube_url: formData.get("youtube_url") as string,
        title: formData.get("title") as string,
        is_live_stream: (formData.get("is_live_stream") as string) || "false",
        is_featured: (formData.get("is_featured") as string) || "false",
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
    stream_date: (formData.get("stream_date") as string) || "",
    youtube_url: (formData.get("youtube_url") as string) || "",
    title: (formData.get("title") as string) || "",
    is_live_stream: ((formData.get("is_live_stream") as string) || "false") as "true" | "false",
    is_featured: ((formData.get("is_featured") as string) || "false") as "true" | "false",
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.data.stream_date)) {
      return { success: 0, errors: 1, message: "Fecha inválida (use YYYY-MM-DD)", body };
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

    const videoId = extractYouTubeVideoId(parsed.data.youtube_url);
    if (!videoId) {
      return {
        success: 0,
        errors: 1,
        message: "No se pudo extraer el ID del video de YouTube. Verifica la URL.",
        body,
      };
    }

    const meta = await fetchYouTubeOEmbedByUrl(parsed.data.youtube_url);
    const title = parsed.data.title || meta.title || null;
    const isLive = parsed.data.is_live_stream === "true" ? 1 : 0;
    const isFeatured = parsed.data.is_featured === "true" ? 1 : 0;

    await env.DB.prepare(
      `
      INSERT INTO streams (
        stream_date, url, youtube_video_id, is_live_stream, is_featured, title, thumbnail_url, published_at, duration_seconds, start_time, end_time, notes, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.stream_date,
        parsed.data.youtube_url,
        videoId,
        isLive,
        isFeatured,
        title,
        meta.thumbnail_url || null,
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
      stream_date: string;
      youtube_url: string;
      title: string;
      is_live_stream?: string;
      is_featured?: string;
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
        stream_date: (formData.get("stream_date") as string) || "",
        youtube_url: formData.get("youtube_url") as string,
        is_live_stream: (formData.get("is_live_stream") as string) || "false",
        is_featured: (formData.get("is_featured") as string) || "false",
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
    stream_date: (formData.get("stream_date") as string) || "",
    youtube_url: (formData.get("youtube_url") as string) || "",
    title: (formData.get("title") as string) || "",
    is_live_stream: ((formData.get("is_live_stream") as string) || "false") as "true" | "false",
    is_featured: ((formData.get("is_featured") as string) || "false") as "true" | "false",
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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.data.stream_date)) {
      return { success: 0, errors: 1, message: "Fecha inválida (use YYYY-MM-DD)", body };
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

    const videoId = extractYouTubeVideoId(parsed.data.youtube_url);
    if (!videoId) {
      return {
        success: 0,
        errors: 1,
        message: "No se pudo extraer el ID del video de YouTube. Verifica la URL.",
        body,
      };
    }

    const meta = await fetchYouTubeOEmbedByUrl(parsed.data.youtube_url);
    const isLive = parsed.data.is_live_stream === "true" ? 1 : 0;
    const isFeatured = parsed.data.is_featured === "true" ? 1 : 0;

    await env.DB.prepare(
      `
      UPDATE streams 
      SET stream_date = ?, url = ?, youtube_video_id = ?, is_live_stream = ?, is_featured = ?, title = ?, thumbnail_url = ?, start_time = ?, end_time = ?, notes = ?
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.stream_date,
        parsed.data.youtube_url,
        videoId,
        isLive,
        isFeatured,
        meta.title || null,
        meta.thumbnail_url || null,
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
    const existingStream = await env.DB.prepare(`SELECT id FROM streams WHERE id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number }>();

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

// Public site helpers
export async function getMainStream(): Promise<Stream | null> {
  const { env } = getRequestContext();

  const main = await env.DB.prepare(
    `
    SELECT s.*
    FROM streams s
    WHERE s.is_featured = 1
    ORDER BY COALESCE(s.start_time, s.stream_date, s.created_at) DESC
    LIMIT 1
  `,
  ).first<Stream>();
  if (main) return main;

  return null;
}

export async function getPastStreams(limit = 12): Promise<Stream[]> {
  const { env } = getRequestContext();
  const past = await env.DB.prepare(
    `
    SELECT s.*
    FROM streams s
    WHERE date(s.stream_date) < date('now') OR (s.is_featured = 0 AND date(s.stream_date) = date('now'))
    ORDER BY COALESCE(s.end_time, s.start_time, s.stream_date, s.created_at) DESC
    LIMIT ?
  `,
  )
    .bind(limit)
    .all<Stream>();
  return past.results || [];
}

export async function featuredStream(): Promise<boolean> {
  const { env } = getRequestContext();
  const stream = await env.DB.prepare(
    `
    SELECT s.is_featured
    FROM streams s
    WHERE s.is_featured = 1
    `
  ).first<Stream>();
  return stream?.is_featured || false;
}