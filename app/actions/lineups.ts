"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Lineup } from "@/lib/types";

// Validation schemas
const lineupCreateSchema = z.object({
  team_id: z.number().min(1, "El ID del equipo es requerido"),
  match_id: z.number().min(1, "El ID del partido es requerido"),
  timestamp: z.string().min(1, "La fecha y hora son requeridas"),
  matrix: z.string().optional(),
});

const lineupUpdateSchema = z.object({
  id: z.number().min(1, "El ID de la alineación es requerido"),
  team_id: z.number().min(1, "El ID del equipo es requerido"),
  match_id: z.number().min(1, "El ID del partido es requerido"),
  timestamp: z.string().min(1, "La fecha y hora son requeridas"),
  matrix: z.string().optional(),
});

const lineupDeleteSchema = z.object({
  id: z.number().min(1, "El ID de la alineación es requerido"),
});

// Database operations
export async function getLineups(): Promise<Lineup[]> {
  const { env } = getRequestContext();
  const lineups = await env.DB.prepare(
    `
    SELECT l.id, l.team_id, l.match_id, l.timestamp, l.matrix, l.created_at,
           t.name as team_name, m.timestamp as match_timestamp,
           lt.name as local_team_name, vt.name as visitor_team_name,
           (lt.name || ' vs ' || vt.name || ' - ' || m.timestamp) as match_description
    FROM lineups l
    LEFT JOIN teams t ON l.team_id = t.id
    LEFT JOIN matches m ON l.match_id = m.id
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    ORDER BY l.created_at DESC
  `,
  ).all<
    Lineup & {
      team_name?: string;
      match_date?: string;
      local_team_name?: string;
      visitor_team_name?: string;
      match_description?: string;
    }
  >();

  return lineups.results || [];
}

export async function getLineupById(id: number): Promise<Lineup | null> {
  const { env } = getRequestContext();
  const lineup = await env.DB.prepare(
    `
    SELECT l.id, l.team_id, l.match_id, l.timestamp, l.matrix, l.created_at,
           t.name as team_name, m.timestamp as match_timestamp,
           lt.name as local_team_name, vt.name as visitor_team_name
    FROM lineups l
    LEFT JOIN teams t ON l.team_id = t.id
    LEFT JOIN matches m ON l.match_id = m.id
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    WHERE l.id = ?
  `,
  )
    .bind(id)
    .first<Lineup>();

  return lineup || null;
}

// Server actions
export async function createLineup(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      team_id: number;
      match_id: number;
      timestamp: string;
      matrix?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear alineaciones",
      body: {
        team_id: parseInt(formData.get("team_id") as string) || 0,
        match_id: parseInt(formData.get("match_id") as string) || 0,
        timestamp: formData.get("timestamp") as string,
        matrix: formData.get("matrix") as string,
      },
    };
  }

  const body = {
    team_id: parseInt(formData.get("team_id") as string) || 0,
    match_id: parseInt(formData.get("match_id") as string) || 0,
    timestamp: formData.get("timestamp") as string,
    matrix: (formData.get("matrix") as string) || undefined,
  };

  const parsed = lineupCreateSchema.safeParse(body);

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
    const team = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.team_id).first();

    if (!team) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no existe",
        body,
      };
    }

    const match = await env.DB.prepare(`SELECT id, local_team_id, visitor_team_id FROM matches WHERE id = ?`)
      .bind(parsed.data.match_id)
      .first<{ id: number; local_team_id: number; visitor_team_id: number }>();

    if (!match) {
      return {
        success: 0,
        errors: 1,
        message: "El partido no existe",
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

    const existingLineup = await env.DB.prepare(`SELECT id FROM lineups WHERE team_id = ? AND match_id = ?`)
      .bind(parsed.data.team_id, parsed.data.match_id)
      .first();

    if (existingLineup) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe una alineación para este equipo en este partido",
        body,
      };
    }

    await env.DB.prepare(
      `
      INSERT INTO lineups (team_id, match_id, timestamp, matrix, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    )
      .bind(parsed.data.team_id, parsed.data.match_id, parsed.data.timestamp, parsed.data.matrix || null)
      .run();

    revalidatePath("/admin/dashboard/lineups");

    return {
      success: 1,
      errors: 0,
      message: `Alineación creada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating lineup:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear la alineación. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateLineup(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      team_id: number;
      match_id: number;
      timestamp: string;
      matrix?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar alineaciones",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        team_id: parseInt(formData.get("team_id") as string) || 0,
        match_id: parseInt(formData.get("match_id") as string) || 0,
        timestamp: formData.get("timestamp") as string,
        matrix: formData.get("matrix") as string,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la alineación inválido",
      body: {
        id: 0,
        team_id: parseInt(formData.get("team_id") as string) || 0,
        match_id: parseInt(formData.get("match_id") as string) || 0,
        timestamp: formData.get("timestamp") as string,
        matrix: formData.get("matrix") as string,
      },
    };
  }

  const body = {
    id,
    team_id: parseInt(formData.get("team_id") as string) || 0,
    match_id: parseInt(formData.get("match_id") as string) || 0,
    timestamp: formData.get("timestamp") as string,
    matrix: (formData.get("matrix") as string) || undefined,
  };

  const parsed = lineupUpdateSchema.safeParse(body);

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
    const existingLineup = await env.DB.prepare(`SELECT id FROM lineups WHERE id = ?`).bind(parsed.data.id).first();

    if (!existingLineup) {
      return {
        success: 0,
        errors: 1,
        message: "La alineación no existe",
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

    const match = await env.DB.prepare(`SELECT id, local_team_id, visitor_team_id FROM matches WHERE id = ?`)
      .bind(parsed.data.match_id)
      .first<{ id: number; local_team_id: number; visitor_team_id: number }>();

    if (!match) {
      return {
        success: 0,
        errors: 1,
        message: "El partido no existe",
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

    const duplicateLineup = await env.DB.prepare(
      `SELECT id FROM lineups WHERE team_id = ? AND match_id = ? AND id != ?`,
    )
      .bind(parsed.data.team_id, parsed.data.match_id, parsed.data.id)
      .first();

    if (duplicateLineup) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe otra alineación para este equipo en este partido",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE lineups 
      SET team_id = ?, match_id = ?, timestamp = ?, matrix = ?
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.team_id,
        parsed.data.match_id,
        parsed.data.timestamp,
        parsed.data.matrix || null,
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/lineups");

    return {
      success: 1,
      errors: 0,
      message: `Alineación actualizada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating lineup:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar la alineación. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteLineup(
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
      message: "No tienes permisos para eliminar alineaciones",
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
      message: "ID de la alineación inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = lineupDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la alineación inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingLineup = await env.DB.prepare(`SELECT id FROM lineups WHERE id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number }>();

    if (!existingLineup) {
      return {
        success: 0,
        errors: 1,
        message: "La alineación no existe",
        body,
      };
    }

    await env.DB.prepare(`DELETE FROM lineups WHERE id = ?`).bind(parsed.data.id).run();

    revalidatePath("/admin/dashboard/lineups");

    return {
      success: 1,
      errors: 0,
      message: `Alineación eliminada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting lineup:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar la alineación. Inténtalo de nuevo.",
      body,
    };
  }
}
