"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";

const schemaCreate = z.object({
  event_id: z.number().min(1),
  player_id: z.number().min(1),
  role: z.enum(["main", "assist", "substituted_in", "substituted_out"]),
});

const schemaUpdate = z.object({
  id: z.number().min(1),
  event_id: z.number().min(1),
  player_id: z.number().min(1),
  role: z.enum(["main", "assist", "substituted_in", "substituted_out"]),
});

const schemaDelete = z.object({ id: z.number().min(1) });

export async function getEventPlayers() {
  const { env } = getRequestContext();
  const rows = await env.DB.prepare(
    `
    SELECT ep.id, ep.event_id, ep.player_id, ep.role,
           e.type, e.minute,
           lt.name as local_team, vt.name as visitor_team, m.timestamp,
           p.first_name || ' ' || p.last_name as player_label, t.name as player_team
    FROM event_players ep
    JOIN events e ON ep.event_id = e.id
    JOIN matches m ON e.match_id = m.id
    JOIN teams lt ON m.local_team_id = lt.id
    JOIN teams vt ON m.visitor_team_id = vt.id
    JOIN players p ON ep.player_id = p.id
    LEFT JOIN teams t ON p.team_id = t.id
    ORDER BY m.timestamp DESC, e.minute ASC
  `,
  ).all();

  const typeLabel = (t: string) =>
    t === "goal"
      ? "Gol"
      : t === "yellow_card"
        ? "Amarilla"
        : t === "red_card"
          ? "Roja"
          : t === "substitution"
            ? "Cambio"
            : "Otro";

  const results = (rows.results || []).map((r: any) => ({
    id: r.id,
    event_id: r.event_id,
    player_id: r.player_id,
    role: r.role,
    event_label: `${typeLabel(r.type)} ${r.minute}' — ${r.local_team} vs ${r.visitor_team} - ${r.timestamp}`,
    player_label: r.player_label + (r.player_team ? ` (${r.player_team})` : ""),
  }));

  return results;
}

export async function createEventPlayer(_prev: any, formData: FormData) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) return { success: 0, errors: 1, message: "No autorizado", body: {} };

  const body = {
    event_id: parseInt(formData.get("event_id") as string),
    player_id: parseInt(formData.get("player_id") as string),
    role: formData.get("role") as string,
  };

  const parsed = schemaCreate.safeParse(body);
  if (!parsed.success) return { success: 0, errors: 1, message: "Datos inválidos", body };

  const { env } = getRequestContext();
  try {
    const eventRow = await env.DB.prepare(`SELECT team_id FROM events WHERE id = ?`).bind(parsed.data.event_id).first();
    const playerRow = await env.DB.prepare(`SELECT team_id FROM players WHERE id = ?`)
      .bind(parsed.data.player_id)
      .first();

    if (!eventRow || !playerRow) return { success: 0, errors: 1, message: "Evento o jugador no existe", body };

    if (eventRow.team_id !== playerRow.team_id) {
      return { success: 0, errors: 1, message: "El jugador no pertenece al equipo del evento", body };
    }

    if (
      parsed.data.role === "main" ||
      parsed.data.role === "assist" ||
      parsed.data.role === "substituted_in" ||
      parsed.data.role === "substituted_out"
    ) {
      if ((eventRow as any).team_id !== (playerRow as any).team_id) {
        return { success: 0, errors: 1, message: "El jugador no pertenece al equipo del evento", body };
      }
    }

    if (parsed.data.role === "main") {
      await env.DB.prepare(`DELETE FROM event_players WHERE event_id = ? AND role = 'main'`)
        .bind(parsed.data.event_id)
        .run();
    }

    await env.DB.prepare(
      `
      INSERT INTO event_players (event_id, player_id, role, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `,
    )
      .bind(parsed.data.event_id, parsed.data.player_id, parsed.data.role)
      .run();

    revalidatePath("/admin/dashboard/event-players");
    revalidatePath("/admin/dashboard/events");
    return { success: 1, errors: 0, message: "Vinculación creada", body };
  } catch (error) {
    return { success: 0, errors: 1, message: "Error al crear vinculación", body };
  }
}

export async function updateEventPlayer(_prev: any, formData: FormData) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) return { success: 0, errors: 1, message: "No autorizado", body: {} };

  const body = {
    id: parseInt(formData.get("id") as string),
    event_id: parseInt(formData.get("event_id") as string),
    player_id: parseInt(formData.get("player_id") as string),
    role: formData.get("role") as string,
  };

  const parsed = schemaUpdate.safeParse(body);
  if (!parsed.success) return { success: 0, errors: 1, message: "Datos inválidos", body };

  const { env } = getRequestContext();
  try {
    const exists = await env.DB.prepare(`SELECT id FROM event_players WHERE id = ?`).bind(parsed.data.id).first();
    if (!exists) return { success: 0, errors: 1, message: "Vinculación no existe", body };

    const eventRow = await env.DB.prepare(`SELECT team_id FROM events WHERE id = ?`).bind(parsed.data.event_id).first();
    const playerRow = await env.DB.prepare(`SELECT team_id FROM players WHERE id = ?`)
      .bind(parsed.data.player_id)
      .first();
    if (!eventRow || !playerRow) return { success: 0, errors: 1, message: "Evento o jugador no existe", body };
    if (
      parsed.data.role === "main" ||
      parsed.data.role === "assist" ||
      parsed.data.role === "substituted_in" ||
      parsed.data.role === "substituted_out"
    ) {
      if ((eventRow as any).team_id !== (playerRow as any).team_id) {
        return { success: 0, errors: 1, message: "El jugador no pertenece al equipo del evento", body };
      }
    }

    if (parsed.data.role === "main") {
      await env.DB.prepare(`DELETE FROM event_players WHERE event_id = ? AND role = 'main' AND id != ?`)
        .bind(parsed.data.event_id, parsed.data.id)
        .run();
    }

    await env.DB.prepare(
      `
      UPDATE event_players
      SET event_id = ?, player_id = ?, role = ?
      WHERE id = ?
    `,
    )
      .bind(parsed.data.event_id, parsed.data.player_id, parsed.data.role, parsed.data.id)
      .run();

    revalidatePath("/admin/dashboard/event-players");
    revalidatePath("/admin/dashboard/events");
    return { success: 1, errors: 0, message: "Vinculación actualizada", body };
  } catch (error) {
    return { success: 0, errors: 1, message: "Error al actualizar vinculación", body };
  }
}

export async function deleteEventPlayer(_prev: any, formData: FormData) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) return { success: 0, errors: 1, message: "No autorizado", body: {} };

  const body = { id: parseInt(formData.get("id") as string) };
  const parsed = schemaDelete.safeParse(body);
  if (!parsed.success) return { success: 0, errors: 1, message: "Datos inválidos", body };

  const { env } = getRequestContext();
  try {
    const exists = await env.DB.prepare(`SELECT id FROM event_players WHERE id = ?`).bind(parsed.data.id).first();
    if (!exists) return { success: 0, errors: 1, message: "Vinculación no existe", body };

    await env.DB.prepare(`DELETE FROM event_players WHERE id = ?`).bind(parsed.data.id).run();
    revalidatePath("/admin/dashboard/event-players");
    revalidatePath("/admin/dashboard/events");
    return { success: 1, errors: 0, message: "Vinculación eliminada", body };
  } catch (error) {
    return { success: 0, errors: 1, message: "Error al eliminar vinculación", body };
  }
}
