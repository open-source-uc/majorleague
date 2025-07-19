"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Match } from "@/lib/types";

// Validation schemas
const matchCreateSchema = z.object({
  local_team_id: z.number().min(1, "El equipo local es requerido"),
  visitor_team_id: z.number().min(1, "El equipo visitante es requerido"),
  competition_id: z.number().min(1, "La competición es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  timestamptz: z.string().min(1, "La hora es requerida"),
  location: z.string().optional(),
  status: z.enum(["scheduled", "cancelled", "live", "in review"]).optional(),
});

const matchUpdateSchema = z.object({
  id: z.number().min(1, "El ID del partido es requerido"),
  local_team_id: z.number().min(1, "El equipo local es requerido"),
  visitor_team_id: z.number().min(1, "El equipo visitante es requerido"),
  competition_id: z.number().min(1, "La competición es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  timestamptz: z.string().min(1, "La hora es requerida"),
  location: z.string().optional(),
  local_score: z.number().min(0, "El marcador local debe ser 0 o mayor").optional(),
  visitor_score: z.number().min(0, "El marcador visitante debe ser 0 o mayor").optional(),
  status: z.enum(["scheduled", "live", "finished", "cancelled", "in review"]).optional(),
});

const matchDeleteSchema = z.object({
  id: z.number().min(1, "El ID del partido es requerido"),
});

// Database operations
export async function getMatches(): Promise<Match[]> {
  const { env } = getRequestContext();
  const matches = await env.DB.prepare(
    `
    SELECT m.id, m.local_team_id, m.visitor_team_id, m.competition_id, m.date, m.timestamptz, 
           m.location, m.local_score, m.visitor_score, m.status, m.created_at, m.updated_at,
           lt.name as local_team_name, vt.name as visitor_team_name, c.name as competition_name
    FROM matches m
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    LEFT JOIN competitions c ON m.competition_id = c.id
    ORDER BY m.date DESC, m.timestamptz DESC
  `,
  ).all<Match & { local_team_name?: string; visitor_team_name?: string; competition_name?: string }>();

  return matches.results || [];
}

export async function getMatchById(id: number): Promise<Match | null> {
  const { env } = getRequestContext();
  const match = await env.DB.prepare(
    `
    SELECT m.id, m.local_team_id, m.visitor_team_id, m.competition_id, m.date, m.timestamptz, 
           m.location, m.local_score, m.visitor_score, m.status, m.created_at, m.updated_at,
           lt.name as local_team_name, vt.name as visitor_team_name, c.name as competition_name
    FROM matches m
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    LEFT JOIN competitions c ON m.competition_id = c.id
    WHERE m.id = ?
  `,
  )
    .bind(id)
    .first<Match>();

  return match || null;
}

// Server actions
export async function createMatch(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      local_team_id: number;
      visitor_team_id: number;
      competition_id: number;
      date: string;
      timestamptz: string;
      location?: string;
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
      message: "No tienes permisos para crear partidos",
      body: {
        local_team_id: parseInt(formData.get("local_team_id") as string) || 0,
        visitor_team_id: parseInt(formData.get("visitor_team_id") as string) || 0,
        competition_id: parseInt(formData.get("competition_id") as string) || 0,
        date: formData.get("date") as string,
        timestamptz: formData.get("timestamptz") as string,
        location: formData.get("location") as string,
        status: formData.get("status") as string,
      },
    };
  }

  // Helper function to convert datetime-local format to database format
  const convertDateTimeLocal = (datetimeLocal: string) => {
    if (!datetimeLocal) return datetimeLocal;
    // Convert from "YYYY-MM-DDTHH:MM" to "YYYY-MM-DD HH:MM:SS"
    return datetimeLocal.replace("T", " ") + ":00";
  };

  const body = {
    local_team_id: parseInt(formData.get("local_team_id") as string) || 0,
    visitor_team_id: parseInt(formData.get("visitor_team_id") as string) || 0,
    competition_id: parseInt(formData.get("competition_id") as string) || 0,
    date: formData.get("date") as string,
    timestamptz: convertDateTimeLocal(formData.get("timestamptz") as string),
    location: (formData.get("location") as string) || undefined,
    status: (formData.get("status") as string) || "in review",
  };

  const parsed = matchCreateSchema.safeParse(body);

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
    if (parsed.data.local_team_id === parsed.data.visitor_team_id) {
      return {
        success: 0,
        errors: 1,
        message: "Los equipos local y visitante deben ser diferentes",
        body,
      };
    }

    const localTeam = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.local_team_id).first();

    const visitorTeam = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`)
      .bind(parsed.data.visitor_team_id)
      .first();

    if (!localTeam || !visitorTeam) {
      return {
        success: 0,
        errors: 1,
        message: "Uno o ambos equipos no existen",
        body,
      };
    }

    const competition = await env.DB.prepare(`SELECT id FROM competitions WHERE id = ?`)
      .bind(parsed.data.competition_id)
      .first();

    if (!competition) {
      return {
        success: 0,
        errors: 1,
        message: "La competición no existe",
        body,
      };
    }

    await env.DB.prepare(
      `
      INSERT INTO matches (local_team_id, visitor_team_id, competition_id, date, timestamptz, location, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.local_team_id,
        parsed.data.visitor_team_id,
        parsed.data.competition_id,
        parsed.data.date,
        parsed.data.timestamptz,
        parsed.data.location || null,
        parsed.data.status || "in review",
      )
      .run();

    revalidatePath("/admin/dashboard/matches");

    return {
      success: 1,
      errors: 0,
      message: `Partido creado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating match:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear el partido. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateMatch(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      local_team_id: number;
      visitor_team_id: number;
      competition_id: number;
      date: string;
      timestamptz: string;
      location?: string;
      local_score?: number;
      visitor_score?: number;
      status?: string;
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
      message: "No tienes permisos para actualizar partidos",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        local_team_id: parseInt(formData.get("local_team_id") as string) || 0,
        visitor_team_id: parseInt(formData.get("visitor_team_id") as string) || 0,
        competition_id: parseInt(formData.get("competition_id") as string) || 0,
        date: formData.get("date") as string,
        timestamptz: formData.get("timestamptz") as string,
        location: formData.get("location") as string,
        local_score: parseInt(formData.get("local_score") as string) || 0,
        visitor_score: parseInt(formData.get("visitor_score") as string) || 0,
        status: formData.get("status") as string,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID del partido inválido",
      body: {
        id: 0,
        local_team_id: parseInt(formData.get("local_team_id") as string) || 0,
        visitor_team_id: parseInt(formData.get("visitor_team_id") as string) || 0,
        competition_id: parseInt(formData.get("competition_id") as string) || 0,
        date: formData.get("date") as string,
        timestamptz: formData.get("timestamptz") as string,
        location: formData.get("location") as string,
        local_score: parseInt(formData.get("local_score") as string) || 0,
        visitor_score: parseInt(formData.get("visitor_score") as string) || 0,
        status: formData.get("status") as string,
      },
    };
  }

  // Helper function to convert datetime-local format to database format
  const convertDateTimeLocal = (datetimeLocal: string) => {
    if (!datetimeLocal) return datetimeLocal;
    // Convert from "YYYY-MM-DDTHH:MM" to "YYYY-MM-DD HH:MM:SS"
    return datetimeLocal.replace("T", " ") + ":00";
  };

  const body = {
    id,
    local_team_id: parseInt(formData.get("local_team_id") as string) || 0,
    visitor_team_id: parseInt(formData.get("visitor_team_id") as string) || 0,
    competition_id: parseInt(formData.get("competition_id") as string) || 0,
    date: formData.get("date") as string,
    timestamptz: convertDateTimeLocal(formData.get("timestamptz") as string),
    location: (formData.get("location") as string) || undefined,
    local_score: parseInt(formData.get("local_score") as string) || 0,
    visitor_score: parseInt(formData.get("visitor_score") as string) || 0,
    status: (formData.get("status") as string) || "in review",
  };

  const parsed = matchUpdateSchema.safeParse(body);

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
    const existingMatch = await env.DB.prepare(`SELECT id, status FROM matches WHERE id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number; status: string }>();

    if (!existingMatch) {
      return {
        success: 0,
        errors: 1,
        message: "El partido no existe",
        body,
      };
    }

    if (parsed.data.status === "finished" && existingMatch.status !== "in review") {
      return {
        success: 0,
        errors: 1,
        message: "Un partido solo puede pasar a 'terminado' desde 'en revisión'",
        body,
      };
    }

    if (parsed.data.status === "live" && existingMatch.status !== "in review") {
      return {
        success: 0,
        errors: 1,
        message: "Un partido solo puede pasar a 'en vivo' desde 'en revisión'",
        body,
      };
    }

    if (existingMatch.status === "finished" && parsed.data.status !== "in review") {
      return {
        success: 0,
        errors: 1,
        message: "No se pueden modificar partidos terminados",
        body,
      };
    }

    if (parsed.data.local_team_id === parsed.data.visitor_team_id) {
      return {
        success: 0,
        errors: 1,
        message: "Los equipos local y visitante deben ser diferentes",
        body,
      };
    }

    const localTeam = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.local_team_id).first();

    const visitorTeam = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`)
      .bind(parsed.data.visitor_team_id)
      .first();

    if (!localTeam || !visitorTeam) {
      return {
        success: 0,
        errors: 1,
        message: "Uno o ambos equipos no existen",
        body,
      };
    }

    const competition = await env.DB.prepare(`SELECT id FROM competitions WHERE id = ?`)
      .bind(parsed.data.competition_id)
      .first();

    if (!competition) {
      return {
        success: 0,
        errors: 1,
        message: "La competición no existe",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE matches 
      SET local_team_id = ?, visitor_team_id = ?, competition_id = ?, date = ?, timestamptz = ?, 
          location = ?, local_score = ?, visitor_score = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.local_team_id,
        parsed.data.visitor_team_id,
        parsed.data.competition_id,
        parsed.data.date,
        parsed.data.timestamptz,
        parsed.data.location || null,
        parsed.data.local_score || 0,
        parsed.data.visitor_score || 0,
        parsed.data.status || "in review",
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/matches");

    return {
      success: 1,
      errors: 0,
      message: `Partido actualizado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating match:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar el partido. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteMatch(
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
      message: "No tienes permisos para eliminar partidos",
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
      message: "ID del partido inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = matchDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID del partido inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingMatch = await env.DB.prepare(
      `
      SELECT m.id, lt.name as local_team_name, vt.name as visitor_team_name 
      FROM matches m
      LEFT JOIN teams lt ON m.local_team_id = lt.id
      LEFT JOIN teams vt ON m.visitor_team_id = vt.id
      WHERE m.id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ id: number; local_team_name?: string; visitor_team_name?: string }>();

    if (!existingMatch) {
      return {
        success: 0,
        errors: 1,
        message: "El partido no existe",
        body,
      };
    }

    const hasEvents = await env.DB.prepare(`SELECT COUNT(*) as count FROM events WHERE match_id = ?`)
      .bind(parsed.data.id)
      .first<{ count: number }>();

    const hasStreams = await env.DB.prepare(`SELECT COUNT(*) as count FROM streams WHERE match_id = ?`)
      .bind(parsed.data.id)
      .first<{ count: number }>();

    if ((hasEvents?.count ?? 0) > 0 || (hasStreams?.count ?? 0) > 0) {
      return {
        success: 0,
        errors: 1,
        message: "No se puede eliminar el partido porque tiene eventos o streams asociados",
        body,
      };
    }

    await env.DB.prepare(`DELETE FROM matches WHERE id = ?`).bind(parsed.data.id).run();

    revalidatePath("/admin/dashboard/matches");

    return {
      success: 1,
      errors: 0,
      message: `Partido eliminado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting match:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar el partido. Inténtalo de nuevo.",
      body,
    };
  }
}
