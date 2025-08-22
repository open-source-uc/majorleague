"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";

export interface MatchPlanillero {
  id: number;
  match_id: number;
  profile_id: string;
  status: "assigned" | "in_progress" | "completed" | "admin_review";
  created_at?: string;
  updated_at?: string;
}

export interface MatchPlanilleroExtended extends MatchPlanillero {
  local_team_id: number;
  visitor_team_id: number;
  timestamp: string;
  local_team_name: string;
  visitor_team_name: string;
  match_status: "scheduled" | "live" | "admin_review" | "finished" | "cancelled";
  local_score: number;
  visitor_score: number;
  location?: string;
  planillero_status: "assigned" | "in_progress" | "completed" | "waiting_agreement" | "admin_review";
}

export interface MatchAdminValidation {
  id: number;
  match_id: number;
  admin_profile_id: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  validated_at?: string;
  created_at?: string;
}

export interface MatchAttendance {
  id: number;
  match_id: number;
  player_id: number;
  status: "present" | "absent" | "substitute";
  jersey_number?: number;
  created_at?: string;
  updated_at?: string;
}

const baseIdSchema = {
  match_id: z.number().min(1),
  team_id: z.number().min(1),
  player_id: z.number().min(1),
  profile_id: z.string().min(1),
};

const attendanceStatusSchema = z.enum(["present", "absent", "substitute"]);
const jerseyNumberSchema = z.number().min(1).max(99).optional();

const assignPlanilleroSchema = z.object({
  match_id: baseIdSchema.match_id,
  profile_id: baseIdSchema.profile_id,
});

const attendanceUpdateSchema = z.object({
  match_id: baseIdSchema.match_id,
  player_id: baseIdSchema.player_id,
  status: attendanceStatusSchema,
  jersey_number: jerseyNumberSchema,
});

const bulkAttendanceUpdateSchema = z.object({
  match_id: baseIdSchema.match_id,
  updates: z
    .array(
      z.object({
        player_id: baseIdSchema.player_id,
        status: attendanceStatusSchema,
        jersey_number: jerseyNumberSchema,
      }),
    )
    .min(1),
});

const createResponse = (success: boolean, message: string, body?: any) => ({
  success: success ? 1 : 0,
  errors: success ? 0 : 1,
  message,
  ...(body && { body }),
});

const handleActionError = (error: any, context: string, defaultMessage: string = "Error interno del servidor") => {
  console.error(`${context}:`, error);
  return createResponse(false, defaultMessage);
};

// Helpers
function normalizeAttendance(rows: Array<{ player_id: number; status: string; jersey_number: number | null }>) {
  const simplified = rows.map((r) => ({
    player_id: r.player_id,
    status: r.status,
    jersey_number: r.jersey_number ?? null,
  }));
  simplified.sort((a, b) => a.player_id - b.player_id);
  return JSON.stringify(simplified);
}

function normalizeEvents(rows: Array<{ team_id: number; player_id: number; type: string; minute: number }>) {
  const simplified = rows.map((r) => ({
    team_id: r.team_id,
    player_id: r.player_id,
    type: r.type,
    minute: r.minute,
  }));
  simplified.sort(
    (a, b) => a.team_id - b.team_id || a.minute - b.minute || a.type.localeCompare(b.type) || a.player_id - b.player_id,
  );
  return JSON.stringify(simplified);
}

export async function getPlanilleroMatches(profile_id: string, status?: string | string[]) {
  try {
    const { env } = getRequestContext();

    let query = `
      SELECT 
        m.*, 
        lt.name as local_team_name,
        vt.name as visitor_team_name,
        mp.status as planillero_status
      FROM matches m
      JOIN teams lt ON m.local_team_id = lt.id
      JOIN teams vt ON m.visitor_team_id = vt.id
      JOIN match_planilleros mp ON m.id = mp.match_id
      WHERE mp.profile_id = ?`;

    const params = [profile_id];

    if (status) {
      if (Array.isArray(status)) {
        const placeholders = status.map(() => "?").join(", ");
        query += ` AND m.status IN (${placeholders})`;
        params.push(...status);
      } else {
        query += ` AND m.status = ?`;
        params.push(status);
      }
    } else {
      query += ` AND m.status IN ('scheduled', 'live', 'admin_review')`;
    }

    query += ` ORDER BY m.timestamp ASC`;

    const matches = await env.DB.prepare(query)
      .bind(...params)
      .all();
    return matches.results || [];
  } catch (error) {
    console.error(`Error getting planillero matches for profile ${profile_id}:`, error);
    return [];
  }
}

export async function getPlanilleroMatchesByStatus(profile_id: string, status: string) {
  return getPlanilleroMatches(profile_id, status);
}

export async function getPlanilleroMatchesGroupedByStatus(profile_id: string): Promise<{
  live: MatchPlanilleroExtended[];
  admin_review: MatchPlanilleroExtended[];
  scheduled: MatchPlanilleroExtended[];
}> {
  try {
    const { env } = getRequestContext();

    const query = `
      SELECT 
        m.*, 
        lt.name as local_team_name,
        vt.name as visitor_team_name,
        mp.status as planillero_status,
        m.status as match_status
      FROM matches m
      JOIN teams lt ON m.local_team_id = lt.id
      JOIN teams vt ON m.visitor_team_id = vt.id
      JOIN match_planilleros mp ON m.id = mp.match_id
      WHERE mp.profile_id = ?
        AND m.status IN ('scheduled', 'live', 'admin_review')
      ORDER BY 
        CASE m.status 
          WHEN 'live' THEN 1 
          WHEN 'admin_review' THEN 2
          WHEN 'scheduled' THEN 3 
          ELSE 4 
        END,
        m.timestamp ASC`;

    const matches = await env.DB.prepare(query).bind(profile_id).all<MatchPlanilleroExtended>();
    const results = matches.results || [];

    const grouped = {
      live: results.filter((m) => m.match_status === "live"),
      admin_review: results.filter((m) => m.match_status === "admin_review"),
      scheduled: results.filter((m) => m.match_status === "scheduled"),
    };

    return grouped;
  } catch (error) {
    console.error(`Error getting grouped planillero matches for profile ${profile_id}:`, error);
    return {
      live: [],
      admin_review: [],
      scheduled: [],
    };
  }
}

export async function getMatchAttendance(match_id: number, team_id: number) {
  try {
    const { env } = getRequestContext();
    const attendance = await env.DB.prepare(
      `
      SELECT 
        ma.*,
        p.first_name,
        p.last_name,
        p.nickname,
        p.position,
        p.jersey_number as default_jersey
      FROM match_attendance ma
      JOIN players p ON ma.player_id = p.id
      WHERE ma.match_id = ? AND p.team_id = ?
      ORDER BY p.position, p.last_name
    `,
    )
      .bind(match_id, team_id)
      .all();

    return attendance.results || [];
  } catch (error) {
    console.error(`Error getting match attendance for match ${match_id}, team ${team_id}:`, error);
    return [];
  }
}

export async function getAllMatchAttendance(match_id: number) {
  try {
    const { env } = getRequestContext();
    const attendance = await env.DB.prepare(
      `
      SELECT 
        ma.*,
        p.first_name,
        p.last_name,
        p.nickname,
        p.position,
        p.jersey_number as default_jersey,
        p.team_id
      FROM match_attendance ma
      JOIN players p ON ma.player_id = p.id
      WHERE ma.match_id = ?
      ORDER BY p.team_id, p.position, p.last_name
    `,
    )
      .bind(match_id)
      .all();

    return attendance.results || [];
  } catch (error) {
    console.error(`Error getting all match attendance for match ${match_id}:`, error);
    return [];
  }
}

export async function getMatchPlanilleroInfo(match_id: number, profile_id: string) {
  try {
    const { env } = getRequestContext();
    const info = await env.DB.prepare(
      `
      SELECT 
        mp.*,
        m.status as match_status,
        m.local_team_id,
        m.visitor_team_id,
        m.local_score,
        m.visitor_score,
        m.timestamp,
        m.location,
        lt.name as local_team_name,
        vt.name as visitor_team_name
      FROM match_planilleros mp
      JOIN matches m ON mp.match_id = m.id
      JOIN teams lt ON m.local_team_id = lt.id
      JOIN teams vt ON m.visitor_team_id = vt.id
      WHERE mp.match_id = ? AND mp.profile_id = ?
    `,
    )
      .bind(match_id, profile_id)
      .first();

    return info;
  } catch (error) {
    console.error(`Error getting planillero info for match ${match_id}, profile ${profile_id}:`, error);
    return null;
  }
}

export async function getMatchAdminValidation(match_id: number) {
  try {
    const { env } = getRequestContext();
    const validation = await env.DB.prepare(
      `
      SELECT 
        av.*,
        p.username as admin_username
      FROM match_admin_validations av
      JOIN profiles p ON av.admin_profile_id = p.id
      WHERE av.match_id = ?
    `,
    )
      .bind(match_id)
      .first();

    return validation || null;
  } catch (error) {
    console.error(`Error getting admin validation for match ${match_id}:`, error);
    return null;
  }
}

export async function getMatchEvents(match_id: number, team_id?: number) {
  try {
    const { env } = getRequestContext();

    let query = `
      SELECT 
        e.*,
        COALESCE(
          GROUP_CONCAT(p.first_name || ' ' || p.last_name, ', '), 
          'Sin jugador'
        ) as player_name
      FROM events e
      LEFT JOIN event_players ep ON e.id = ep.event_id AND ep.role = 'main'
      LEFT JOIN players p ON ep.player_id = p.id
      WHERE e.match_id = ?`;

    const params = [match_id];

    if (team_id) {
      query += ` AND e.team_id = ?`;
      params.push(team_id);
    }

    query += ` GROUP BY e.id ORDER BY e.minute ASC`;

    const events = await env.DB.prepare(query)
      .bind(...params)
      .all();

    return events.results || [];
  } catch (error) {
    console.error(`Error getting match events for match ${match_id}, team ${team_id || "all"}:`, error);
    return [];
  }
}

export async function getTeamPlayers(team_id: number) {
  try {
    const { env } = getRequestContext();
    const players = await env.DB.prepare(
      `
      SELECT * FROM players 
      WHERE team_id = ? 
      ORDER BY position, last_name ASC
    `,
    )
      .bind(team_id)
      .all();

    return players.results || [];
  } catch (error) {
    console.error(`Error getting team players for team ${team_id}:`, error);
    return [];
  }
}

export async function getMatchPlanilleroData(match_id: number, profile_id: string) {
  try {
    const { env } = getRequestContext();

    // 1. Get basic match info and planillero status
    const planilleroInfo = await env.DB.prepare(
      `
      SELECT 
        mp.*,
        m.status as match_status,
        m.local_team_id,
        m.visitor_team_id,
        m.local_score,
        m.visitor_score,
        m.timestamp,
        m.location,
        lt.name as local_team_name,
        vt.name as visitor_team_name
      FROM match_planilleros mp
      JOIN matches m ON mp.match_id = m.id
      JOIN teams lt ON m.local_team_id = lt.id
      JOIN teams vt ON m.visitor_team_id = vt.id
      WHERE mp.match_id = ? AND mp.profile_id = ?
    `,
    )
      .bind(match_id, profile_id)
      .first();

    if (!planilleroInfo) return null;

    const matchStatus = planilleroInfo.match_status as string;
    const localTeamId = planilleroInfo.local_team_id as number;
    const visitorTeamId = planilleroInfo.visitor_team_id as number;

    // 2. Get other planillero
    const otherPlanillero = await env.DB.prepare(
      `SELECT profile_id FROM match_planilleros WHERE match_id = ? AND profile_id != ?`,
    )
      .bind(match_id, profile_id)
      .first();
    const otherProfileId = otherPlanillero?.profile_id as string | undefined;

    // 3. Get data based on match status to avoid unnecessary queries
    const baseQueries = [
      // Players (always needed)
      env.DB.prepare(`SELECT * FROM players WHERE team_id IN (?, ?) ORDER BY team_id, position, last_name`)
        .bind(localTeamId, visitorTeamId)
        .all(),
    ];

    let attendanceQuery, eventsQuery, adminQuery;

    if (matchStatus === "scheduled" || matchStatus === "live") {
      // During composition: use drafts, fallback to final
      attendanceQuery = env.DB.prepare(
        `SELECT 
          COALESCE(mad.player_id, ma.player_id) as player_id,
          COALESCE(mad.status, ma.status, 'absent') as status,
          COALESCE(mad.jersey_number, ma.jersey_number) as jersey_number,
          p.team_id, p.first_name, p.last_name, p.nickname, p.position
        FROM players p
        LEFT JOIN match_attendance ma ON ma.player_id = p.id AND ma.match_id = ?
        LEFT JOIN match_attendance_drafts mad ON mad.player_id = p.id AND mad.match_id = ? AND mad.profile_id = ?
        WHERE p.team_id IN (?, ?)
        ORDER BY p.team_id, p.position, p.last_name`,
      )
        .bind(match_id, match_id, profile_id, localTeamId, visitorTeamId)
        .all();

      eventsQuery = env.DB.prepare(
        `SELECT ed.*, p.first_name || ' ' || p.last_name as player_name, p.team_id
        FROM event_drafts ed
        JOIN players p ON p.id = ed.player_id
        WHERE ed.match_id = ? AND ed.profile_id = ?
        ORDER BY ed.minute ASC`,
      )
        .bind(match_id, profile_id)
        .all();
    } else {
      // After validation: use final data
      attendanceQuery = env.DB.prepare(
        `SELECT ma.*, p.team_id, p.first_name, p.last_name, p.nickname, p.position
        FROM match_attendance ma
        JOIN players p ON ma.player_id = p.id
        WHERE ma.match_id = ?
        ORDER BY p.team_id, p.position, p.last_name`,
      )
        .bind(match_id)
        .all();

      eventsQuery = env.DB.prepare(
        `SELECT e.*, ep.player_id, p.first_name || ' ' || p.last_name as player_name, p.team_id
        FROM events e
        LEFT JOIN event_players ep ON e.id = ep.event_id AND ep.role = 'main'
        LEFT JOIN players p ON ep.player_id = p.id
        WHERE e.match_id = ?
        ORDER BY e.minute ASC`,
      )
        .bind(match_id)
        .all();
    }

    // Execute queries
    const queries = [...baseQueries, attendanceQuery, eventsQuery];

    let adminResult = null;
    if (matchStatus === "admin_review") {
      adminResult = await env.DB.prepare(
        `SELECT av.*, p.username as admin_username
        FROM match_admin_validations av
        JOIN profiles p ON av.admin_profile_id = p.id
        WHERE av.match_id = ?`,
      )
        .bind(match_id)
        .first();
    }

    const results = await Promise.all(queries);
    const [playersResult, attendanceResult, eventsResult] = results;

    // Process results
    const allPlayers = playersResult.results || [];
    const localPlayers = allPlayers.filter((p: any) => p.team_id === localTeamId);
    const visitorPlayers = allPlayers.filter((p: any) => p.team_id === visitorTeamId);

    const attendance = attendanceResult.results || [];
    const localAttendance = attendance.filter((a: any) => a.team_id === localTeamId);
    const visitorAttendance = attendance.filter((a: any) => a.team_id === visitorTeamId);

    const events = eventsResult.results || [];
    const localEvents = events.filter((e: any) => e.team_id === localTeamId);
    const visitorEvents = events.filter((e: any) => e.team_id === visitorTeamId);

    // Add attendance info to players
    const addAttendanceToPlayers = (players: any[], attendance: any[]) =>
      players.map((player) => {
        const att = attendance.find((a: any) => a.player_id === player.id);
        return {
          ...player,
          attendance_status: att?.status || "absent",
          jersey_number: att?.jersey_number || player.jersey_number,
        };
      });

    return {
      planilleroInfo,
      localTeamId,
      visitorTeamId,
      localTeamPlayers: localPlayers,
      visitorTeamPlayers: visitorPlayers,
      localTeamAttendance: localAttendance,
      visitorTeamAttendance: visitorAttendance,
      localPlayersWithAttendance: addAttendanceToPlayers(localPlayers, localAttendance),
      visitorPlayersWithAttendance: addAttendanceToPlayers(visitorPlayers, visitorAttendance),
      localEvents,
      visitorEvents,
      localTeamName: planilleroInfo.local_team_name as string,
      visitorTeamName: planilleroInfo.visitor_team_name as string,
      adminValidation: adminResult || null,
      otherProfileId,
    };
  } catch (error) {
    console.error(`Error getting match planillero data for match ${match_id}, profile ${profile_id}:`, error);
    return null;
  }
}

interface AuthValidationOptions {
  requiredMatchStatuses?: string[];
  requirePlayerAccess?: boolean;
}

async function validatePlanilleroAuth(match_id: number, profile_id: string, options: AuthValidationOptions = {}) {
  const { requiredMatchStatuses = ["live", "admin_review"] } = options;

  const { env } = getRequestContext();

  let query = `
    SELECT mp.id, m.local_team_id, m.visitor_team_id, m.status
    FROM match_planilleros mp
    JOIN matches m ON mp.match_id = m.id
    WHERE mp.match_id = ? AND mp.profile_id = ?`;

  const params = [match_id, profile_id];

  if (requiredMatchStatuses.length > 0) {
    const placeholders = requiredMatchStatuses.map(() => "?").join(", ");
    query += ` AND m.status IN (${placeholders})`;
    params.push(...requiredMatchStatuses);
  }

  const result = await env.DB.prepare(query)
    .bind(...params)
    .first();
  return result;
}

// Server Actions
export async function assignPlanillero(_prev: any, formData: FormData) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return createResponse(false, "No autorizado");
  }

  const body = {
    match_id: parseInt(formData.get("match_id") as string),
    profile_id: formData.get("profile_id") as string,
  };

  const parsed = assignPlanilleroSchema.safeParse(body);
  if (!parsed.success) {
    return createResponse(false, "Datos inválidos");
  }

  try {
    const { env } = getRequestContext();
    const match = await env.DB.prepare(`SELECT local_team_id, visitor_team_id FROM matches WHERE id = ?`)
      .bind(parsed.data.match_id)
      .first();

    if (!match) {
      return createResponse(false, "El partido no existe");
    }

    const existingPlanillero = await env.DB.prepare(
      `SELECT id FROM match_planilleros WHERE match_id = ? AND profile_id = ?`,
    )
      .bind(parsed.data.match_id, parsed.data.profile_id)
      .first();

    if (existingPlanillero) {
      return createResponse(false, "Este planillero ya está asignado a este partido");
    }

    const planilleroCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM match_planilleros WHERE match_id = ?`)
      .bind(parsed.data.match_id)
      .first();

    if (planilleroCount && (planilleroCount as any).count >= 2) {
      return createResponse(false, "Ya hay 2 planilleros asignados a este partido");
    }

    await env.DB.prepare(`INSERT INTO match_planilleros (match_id, profile_id) VALUES (?, ?)`)
      .bind(parsed.data.match_id, parsed.data.profile_id)
      .run();

    revalidatePath("/dashboard/planilleros");
    return createResponse(true, "Planillero asignado exitosamente");
  } catch (error) {
    return handleActionError(error, `Error assigning planillero to match ${parsed.data.match_id}`);
  }
}

export async function removePlanillero(_prev: any, formData: FormData) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return { success: 0, errors: 1, message: "No autorizado" };
  }

  const match_id = parseInt(formData.get("match_id") as string);
  const profile_id = formData.get("profile_id") as string;

  if (!match_id || !profile_id) {
    return { success: 0, errors: 1, message: "Datos inválidos" };
  }

  const { env } = getRequestContext();
  try {
    const existingPlanillero = await env.DB.prepare(
      `SELECT id FROM match_planilleros WHERE match_id = ? AND profile_id = ?`,
    )
      .bind(match_id, profile_id)
      .first();

    if (!existingPlanillero) {
      return {
        success: 0,
        errors: 1,
        message: "No hay planillero asignado para este partido",
      };
    }

    await env.DB.prepare(`DELETE FROM match_planilleros WHERE match_id = ? AND profile_id = ?`)
      .bind(match_id, profile_id)
      .run();

    await env.DB.prepare(`DELETE FROM match_attendance WHERE match_id = ?`).bind(match_id).run();

    await env.DB.prepare(`DELETE FROM scorecard_validations WHERE match_id = ? AND validator_profile_id = ?`)
      .bind(match_id, profile_id)
      .run();

    await env.DB.prepare(`DELETE FROM match_admin_validations WHERE match_id = ?`).bind(match_id).run();

    revalidatePath("/dashboard/planilleros");
    return { success: 1, errors: 0, message: "Planillero removido exitosamente" };
  } catch (error) {
    console.error(`Error removing planillero from match ${match_id}:`, error);
    return { success: 0, errors: 1, message: "Error interno del servidor. Por favor, inténtelo nuevamente." };
  }
}

export async function changePlanillero(_prev: any, formData: FormData) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return { success: 0, errors: 1, message: "No autorizado" };
  }

  const body = {
    match_id: parseInt(formData.get("match_id") as string),
    old_profile_id: formData.get("old_profile_id") as string,
    new_profile_id: formData.get("new_profile_id") as string,
  };

  if (!body.match_id || !body.old_profile_id || !body.new_profile_id) {
    return { success: 0, errors: 1, message: "Datos inválidos" };
  }

  const { env } = getRequestContext();
  try {
    const existingPlanillero = await env.DB.prepare(
      `SELECT id FROM match_planilleros WHERE match_id = ? AND profile_id = ?`,
    )
      .bind(body.match_id, body.old_profile_id)
      .first();

    if (!existingPlanillero) {
      return {
        success: 0,
        errors: 1,
        message: "No hay planillero asignado para este partido",
      };
    }

    const conflictingAssignment = await env.DB.prepare(
      `SELECT id FROM match_planilleros WHERE match_id = ? AND profile_id = ?`,
    )
      .bind(body.match_id, body.new_profile_id)
      .first();

    if (conflictingAssignment) {
      return {
        success: 0,
        errors: 1,
        message: "El planillero seleccionado ya está asignado a este partido",
      };
    }

    await env.DB.prepare(
      `UPDATE match_planilleros 
       SET profile_id = ?, status = 'assigned', updated_at = CURRENT_TIMESTAMP 
       WHERE match_id = ? AND profile_id = ?`,
    )
      .bind(body.new_profile_id, body.match_id, body.old_profile_id)
      .run();

    await env.DB.prepare(`DELETE FROM match_attendance WHERE match_id = ?`).bind(body.match_id).run();

    await env.DB.prepare(`DELETE FROM scorecard_validations WHERE match_id = ? AND validator_profile_id = ?`)
      .bind(body.match_id, body.old_profile_id)
      .run();

    await env.DB.prepare(`DELETE FROM match_admin_validations WHERE match_id = ?`).bind(body.match_id).run();

    revalidatePath("/dashboard/planilleros");
    return { success: 1, errors: 0, message: "Planillero cambiado exitosamente" };
  } catch (error) {
    console.error(`Error changing planillero for match ${body.match_id}:`, error);
    return { success: 0, errors: 1, message: "Error interno del servidor. Por favor, inténtelo nuevamente." };
  }
}

// Draft attendance updates (per planillero)
export async function updateAttendanceDraft(_prev: any, formData: FormData) {
  const { isAuthenticated, userProfile } = await getAuthStatus();
  if (!isAuthenticated || !userProfile) {
    return { success: 0, errors: 1, message: "No autorizado" };
  }

  const body = {
    match_id: parseInt(formData.get("match_id") as string),
    player_id: parseInt(formData.get("player_id") as string),
    status: formData.get("status") as string,
    jersey_number: formData.get("jersey_number") ? parseInt(formData.get("jersey_number") as string) : undefined,
  };

  const parsed = attendanceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return { success: 0, errors: 1, message: "Datos inválidos" };
  }

  const { env } = getRequestContext();

  try {
    const authCheck = await validatePlanilleroAuth(parsed.data.match_id, userProfile.id, {
      requiredMatchStatuses: ["scheduled", "live"],
    });

    if (!authCheck) {
      return { success: 0, errors: 1, message: "No autorizado para este partido" };
    }

    const playerTeamCheck = await env.DB.prepare(
      `
      SELECT id, team_id FROM players WHERE id = ?
    `,
    )
      .bind(parsed.data.player_id)
      .first();

    if (!playerTeamCheck) {
      return { success: 0, errors: 1, message: "Jugador no encontrado" };
    }

    // Verify the player belongs to one of the teams in the match
    if (playerTeamCheck.team_id !== authCheck.local_team_id && playerTeamCheck.team_id !== authCheck.visitor_team_id) {
      return { success: 0, errors: 1, message: "El jugador no pertenece a ningún equipo de este partido" };
    }

    await env.DB.prepare(
      `
      INSERT INTO match_attendance_drafts (match_id, player_id, profile_id, status, jersey_number)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(match_id, player_id, profile_id) DO UPDATE SET
        status = excluded.status,
        jersey_number = excluded.jersey_number,
        updated_at = CURRENT_TIMESTAMP
    `,
    )
      .bind(
        parsed.data.match_id,
        parsed.data.player_id,
        userProfile.id,
        parsed.data.status,
        parsed.data.jersey_number || null,
      )
      .run();

    revalidatePath(`/planillero/partido/${parsed.data.match_id}`);
    return { success: 1, errors: 0, message: "Borrador de asistencia actualizado" };
  } catch (error) {
    console.error("Error updating attendance draft:", error);
    return { success: 0, errors: 1, message: "Error al actualizar borrador de asistencia" };
  }
}

export async function updateBulkAttendanceDraft(_prev: any, formData: FormData) {
  const { isAuthenticated, userProfile } = await getAuthStatus();
  if (!isAuthenticated || !userProfile) {
    return { success: 0, errors: 1, message: "No autorizado" };
  }

  const match_id = parseInt(formData.get("match_id") as string);
  const updates: any[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("player_") && key.endsWith("_status")) {
      const playerId = parseInt(key.replace("player_", "").replace("_status", ""));
      const status = value as string;
      const jerseyNumber = formData.get(`player_${playerId}_jersey`);

      updates.push({
        player_id: playerId,
        status,
        jersey_number: jerseyNumber ? parseInt(jerseyNumber as string) : undefined,
      });
    }
  }

  const body = { match_id, updates };
  const parsed = bulkAttendanceUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return { success: 0, errors: 1, message: "Datos inválidos" };
  }

  try {
    const authCheck = await validatePlanilleroAuth(parsed.data.match_id, userProfile.id, {
      requiredMatchStatuses: ["scheduled", "live"],
    });

    if (!authCheck) {
      return { success: 0, errors: 1, message: "No autorizado para este partido" };
    }

    const { env } = getRequestContext();

    const playerIds = parsed.data.updates.map((u) => u.player_id);
    const validPlayers = await env.DB.prepare(
      `
      SELECT id, team_id FROM players 
      WHERE id IN (${playerIds.map(() => "?").join(",")})
    `,
    )
      .bind(...playerIds)
      .all();

    const validPlayerResults = validPlayers.results || [];
    if (validPlayerResults.length !== playerIds.length) {
      return { success: 0, errors: 1, message: "Algunos jugadores no fueron encontrados" };
    }

    // Verify all players belong to teams participating in the match
    const invalidPlayers = validPlayerResults.filter(
      (player: any) => player.team_id !== authCheck.local_team_id && player.team_id !== authCheck.visitor_team_id,
    );

    if (invalidPlayers.length > 0) {
      return { success: 0, errors: 1, message: "Algunos jugadores no pertenecen a ningún equipo de este partido" };
    }

    const statements = parsed.data.updates.map((update) =>
      env.DB.prepare(
        `
        INSERT INTO match_attendance_drafts (match_id, player_id, profile_id, status, jersey_number)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(match_id, player_id, profile_id) DO UPDATE SET
          status = excluded.status,
          jersey_number = excluded.jersey_number,
          updated_at = CURRENT_TIMESTAMP
      `,
      ).bind(parsed.data.match_id, update.player_id, userProfile.id, update.status, update.jersey_number || null),
    );

    await env.DB.batch(statements);

    revalidatePath(`/planillero/partido/${parsed.data.match_id}`);
    return { success: 1, errors: 0, message: `Borrador actualizado para ${updates.length} jugadores` };
  } catch (error) {
    console.error(`Error updating bulk attendance drafts for match ${parsed.data.match_id}:`, error);
    return {
      success: 0,
      errors: 1,
      message: "Error interno del servidor al actualizar borrador de asistencia. Por favor, inténtelo nuevamente.",
    };
  }
}

export async function completePlanillero(_prev: any, formData: FormData) {
  const { isAuthenticated, userProfile } = await getAuthStatus();
  if (!isAuthenticated || !userProfile) {
    return {
      success: 0,
      errors: 1,
      message: "Debes estar autenticado para completar una planilla",
    };
  }

  const match_id = parseInt(formData.get("match_id") as string);
  if (!match_id) {
    return {
      success: 0,
      errors: 1,
      message: "ID del partido inválido",
    };
  }

  try {
    const authCheck = await validatePlanilleroAuth(match_id, userProfile.id, {
      requiredMatchStatuses: ["scheduled", "live"],
    });
    if (!authCheck) {
      return {
        success: 0,
        errors: 1,
        message: "No tienes permisos para completar esta planilla",
      };
    }

    const result = await markPlanilleroCompleted(match_id, userProfile.id);
    return result;
  } catch (error) {
    console.error(`Error completing planillero for match ${match_id}:`, error);
    return {
      success: 0,
      errors: 1,
      message: "Error interno del servidor al completar planilla",
    };
  }
}

// Draft event creation (per planillero)
export async function createDraftEventWithPlayer(_prev: any, formData: FormData) {
  const { isAuthenticated, userProfile } = await getAuthStatus();
  if (!isAuthenticated || !userProfile) {
    return createResponse(false, "No autorizado");
  }
  const body = {
    match_id: parseInt(formData.get("match_id") as string),
    player_id: parseInt(formData.get("player_id") as string),
    event_type: formData.get("event_type") as string,
    minute: parseInt(formData.get("minute") as string),
  };

  const parsed = z
    .object({
      match_id: baseIdSchema.match_id,
      player_id: baseIdSchema.player_id,
      event_type: z.enum(["goal", "yellow_card", "red_card", "substitution", "other"]),
      minute: z.number().min(0).max(120),
    })
    .safeParse(body);

  if (!parsed.success) {
    return createResponse(false, "Datos inválidos: " + parsed.error.errors.map((e) => e.message).join(", "));
  }

  try {
    const { env } = getRequestContext();

    // Verify planillero is assigned to this match
    const planilleroCheck = await env.DB.prepare(
      `SELECT mp.id FROM match_planilleros mp
       JOIN matches m ON mp.match_id = m.id
       WHERE mp.match_id = ? AND mp.profile_id = ?
         AND m.status IN ('live')`,
    )
      .bind(body.match_id, userProfile.id)
      .first();

    if (!planilleroCheck) {
      return createResponse(false, "No autorizado para este partido");
    }

    // Verify player exists and get team info
    const playerCheck = await env.DB.prepare(
      `SELECT p.team_id, ma.status as attendance_status
       FROM players p
       LEFT JOIN match_attendance ma ON ma.player_id = p.id AND ma.match_id = ?
       WHERE p.id = ?`,
    )
      .bind(body.match_id, body.player_id)
      .first();

    if (!playerCheck) {
      return createResponse(false, "Jugador no encontrado");
    }

    // Require presence in MY draft attendance
    const draftAttendance = await env.DB.prepare(
      `SELECT status FROM match_attendance_drafts WHERE match_id = ? AND player_id = ? AND profile_id = ?`,
    )
      .bind(body.match_id, body.player_id, userProfile.id)
      .first();
    if (!draftAttendance || draftAttendance.status !== "present") {
      return createResponse(false, "El jugador debe estar marcado como presente en tu borrador para registrar eventos");
    }

    // Check if the match is already validated by both planilleros
    const validationCheck = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM scorecard_validations 
       WHERE match_id = ? AND status = 'approved'`,
    )
      .bind(body.match_id)
      .first();

    if (validationCheck && (validationCheck as any).count >= 2) {
      return createResponse(false, "No puedes modificar eventos: el partido ya ha sido validado por ambos planilleros");
    }

    await env.DB.prepare(
      `
      INSERT INTO event_drafts (match_id, team_id, player_id, type, minute, description, profile_id, created_at)
      VALUES (?, ?, ?, ?, ?, NULL, ?, CURRENT_TIMESTAMP)
    `,
    )
      .bind(body.match_id, playerCheck.team_id, body.player_id, body.event_type, body.minute, userProfile.id)
      .run();

    revalidatePath(`/planillero/partido/${body.match_id}`);
    return createResponse(true, "Evento guardado en tu borrador");
  } catch (error) {
    return handleActionError(error, `Error creating draft event for match ${body.match_id}`);
  }
}

export async function markPlanilleroCompleted(match_id: number, profile_id: string) {
  const { env } = getRequestContext();
  try {
    await env.DB.prepare(`UPDATE match_planilleros SET status = 'completed' WHERE match_id = ? AND profile_id = ?`)
      .bind(match_id, profile_id)
      .run();

    revalidatePath(`/planillero/partido/${match_id}`);
    return { success: 1, errors: 0, message: "Planilla completada" };
  } catch (error) {
    console.error(`Error marking planillero as completed for match ${match_id}:`, error);
    return { success: 0, errors: 1, message: "Error al completar planilla" };
  }
}

export async function isPlanillero(profile_id: string): Promise<boolean> {
  const { env } = getRequestContext();
  try {
    const result = await env.DB.prepare(
      `
      SELECT COUNT(*) as count
      FROM match_planilleros mp
      JOIN matches m ON mp.match_id = m.id
      WHERE mp.profile_id = ?
      AND m.status IN ('scheduled', 'live')
    `,
    )
      .bind(profile_id)
      .first();

    return (result?.count as number) > 0;
  } catch (error) {
    return false;
  }
}

export async function getMatchesWithoutPlanilleros() {
  const { env } = getRequestContext();
  try {
    const result = await env.DB.prepare(
      `
      SELECT
        m.*,
        lt.name AS local_team_name,
        vt.name AS visitor_team_name,
        COUNT(mp.id) as planilleros_count
      FROM matches m
      JOIN teams lt ON m.local_team_id = lt.id
      JOIN teams vt ON m.visitor_team_id = vt.id
      LEFT JOIN match_planilleros mp ON mp.match_id = m.id
      WHERE m.status IN ('scheduled', 'live')
        AND m.timestamp > datetime('now')
      GROUP BY m.id
      HAVING COUNT(mp.id) < 2
      ORDER BY m.timestamp ASC
    `,
    ).all();
    return result.results || [];
  } catch (error) {
    console.error("Error getting matches without planilleros:", error);
    return [];
  }
}

export async function getMatchesWithPlanilleros() {
  const { env } = getRequestContext();
  try {
    const result = await env.DB.prepare(
      `
      SELECT
        m.*,
        lt.name AS local_team_name,
        vt.name AS visitor_team_name,
        COUNT(mp.id) as planilleros_count
      FROM matches m
      JOIN teams lt ON m.local_team_id = lt.id
      JOIN teams vt ON m.visitor_team_id = vt.id
      LEFT JOIN match_planilleros mp ON mp.match_id = m.id
      WHERE m.status IN ('scheduled', 'live', 'admin_review')
      GROUP BY m.id
      HAVING COUNT(mp.id) < 2
      ORDER BY m.timestamp ASC
    `,
    ).all();

    const matches = result.results || [];

    const matchesWithPlanilleros = await Promise.all(
      matches.map(async (match: any) => {
        const planillerosResult = await env.DB.prepare(
          `
          SELECT 
            mp.profile_id,
            mp.status as planillero_status,
            p.username
          FROM match_planilleros mp
          JOIN profiles p ON mp.profile_id = p.id
          WHERE mp.match_id = ?
        `,
        )
          .bind(match.id)
          .all();

        const planilleros = planillerosResult.results || [];

        return {
          ...match,
          planilleros: planilleros,
        };
      }),
    );

    return matchesWithPlanilleros;
  } catch (error) {
    console.error("Error getting matches with planilleros:", error);
    return [];
  }
}

export async function getAllMatchesWithPlanilleros() {
  const { env } = getRequestContext();
  try {
    const result = await env.DB.prepare(
      `
      SELECT
        m.*,
        lt.name AS local_team_name,
        vt.name AS visitor_team_name,
        COUNT(mp.id) as planilleros_count
      FROM matches m
      JOIN teams lt ON m.local_team_id = lt.id
      JOIN teams vt ON m.visitor_team_id = vt.id
      LEFT JOIN match_planilleros mp ON mp.match_id = m.id
      WHERE m.status IN ('scheduled', 'live', 'admin_review')
      GROUP BY m.id
      ORDER BY m.timestamp ASC
    `,
    ).all();

    const matches = result.results || [];

    const matchesWithPlanilleros = await Promise.all(
      matches.map(async (match: any) => {
        const planillerosResult = await env.DB.prepare(
          `
          SELECT 
            mp.profile_id,
            mp.status as planillero_status,
            p.username
          FROM match_planilleros mp
          JOIN profiles p ON mp.profile_id = p.id
          WHERE mp.match_id = ?
        `,
        )
          .bind(match.id)
          .all();

        const planilleros = planillerosResult.results || [];

        return {
          ...match,
          planilleros: planilleros,
        };
      }),
    );

    return matchesWithPlanilleros;
  } catch (error) {
    console.error("Error getting all matches with planilleros:", error);
    return [];
  }
}

// Server action to handle consolidated admin approval with custom data
export async function validateMatchWithConsolidatedData(_prev: any, formData: FormData) {
  const { isAdmin, userProfile } = await getAuthStatus();
  if (!isAdmin || !userProfile) {
    return createResponse(false, "No autorizado");
  }

  const body = {
    match_id: parseInt(formData.get("match_id") as string),
    comments: (formData.get("comments") as string) || undefined,
    attendance_data: formData.get("attendance_data") as string,
    events_data: formData.get("events_data") as string,
  };

  const schema = z.object({
    match_id: z.number().min(1, "ID del partido requerido"),
    comments: z.string().optional(),
    attendance_data: z.string(),
    events_data: z.string(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return createResponse(false, "Datos inválidos");
  }

  try {
    const { env } = getRequestContext();

    // Verify match is in admin_review status
    const match = await env.DB.prepare(
      `SELECT status, competition_id, local_team_id, visitor_team_id FROM matches WHERE id = ?`,
    )
      .bind(parsed.data.match_id)
      .first();

    if (!match || match.status !== "admin_review") {
      return createResponse(false, "El partido no está en estado de revisión administrativa");
    }

    // Parse consolidated data (admin always approves, but with their resolved data)
    const attendanceData = JSON.parse(parsed.data.attendance_data);
    const eventsData = JSON.parse(parsed.data.events_data);

    // Clear existing final data
    await env.DB.prepare(`DELETE FROM match_attendance WHERE match_id = ?`).bind(parsed.data.match_id).run();
    await env.DB.prepare(`DELETE FROM events WHERE match_id = ?`).bind(parsed.data.match_id).run();

    // Insert consolidated attendance data
    if (attendanceData && attendanceData.length > 0) {
      const attendanceInsertQuery = `
        INSERT INTO match_attendance (match_id, player_id, status, jersey_number, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      for (const attendance of attendanceData) {
        await env.DB.prepare(attendanceInsertQuery)
          .bind(parsed.data.match_id, attendance.player_id, attendance.status, attendance.jersey_number || null)
          .run();
      }
    }

    // Insert consolidated events data
    if (eventsData && eventsData.length > 0) {
      const eventInsertQuery = `
        INSERT INTO events (match_id, team_id, type, minute, description, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      for (const event of eventsData) {
        const eventResult = await env.DB.prepare(eventInsertQuery)
          .bind(parsed.data.match_id, event.team_id, event.type, event.minute, event.description || null)
          .run();

        // Insert event_players entry
        await env.DB.prepare(
          `
          INSERT INTO event_players (event_id, player_id, role, created_at)
          VALUES (?, ?, 'main', CURRENT_TIMESTAMP)
        `,
        )
          .bind(eventResult.meta.last_row_id, event.player_id)
          .run();
      }
    }

    // Mark match as finished - this will trigger the points calculation
    await env.DB.prepare(`UPDATE matches SET status = 'finished' WHERE id = ?`).bind(parsed.data.match_id).run();

    // Save admin validation record
    await env.DB.prepare(
      `INSERT INTO match_admin_validations 
       (match_id, admin_profile_id, status, comments, validated_at)
       VALUES (?, ?, 'approved', ?, CURRENT_TIMESTAMP)
       ON CONFLICT(match_id) DO UPDATE SET
         admin_profile_id = excluded.admin_profile_id,
         status = 'approved',
         comments = excluded.comments,
         validated_at = excluded.validated_at`,
    )
      .bind(parsed.data.match_id, userProfile.id, parsed.data.comments || null)
      .run();

    revalidatePath("/dashboard/planilleros");
    return createResponse(true, "Partido finalizado exitosamente con los datos consolidados del administrador");
  } catch (error) {
    return handleActionError(error, `Error processing consolidated validation for match ${parsed.data.match_id}`);
  }
}

// Helper function to get detailed comparison data for admin
export async function getMatchComparisonData(match_id: number) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) return null;

  try {
    const { env } = getRequestContext();

    // Get both planilleros
    const planilleros = await env.DB.prepare(
      `SELECT profile_id, p.username FROM match_planilleros mp JOIN profiles p ON mp.profile_id = p.id WHERE mp.match_id = ? ORDER BY mp.id ASC`,
    )
      .bind(match_id)
      .all();

    if (!planilleros.results || planilleros.results.length !== 2) {
      return null;
    }

    const [planillero1, planillero2] = planilleros.results as any[];

    // Get drafts from both planilleros
    const [attendance1, attendance2, events1, events2] = await Promise.all([
      env.DB.prepare(
        `
        SELECT mad.*, p.first_name, p.last_name, p.team_id, t.name as team_name
        FROM match_attendance_drafts mad 
        JOIN players p ON mad.player_id = p.id 
        JOIN teams t ON p.team_id = t.id
        WHERE mad.match_id = ? AND mad.profile_id = ?
        ORDER BY p.team_id, p.last_name
      `,
      )
        .bind(match_id, planillero1.profile_id)
        .all(),

      env.DB.prepare(
        `
        SELECT mad.*, p.first_name, p.last_name, p.team_id, t.name as team_name
        FROM match_attendance_drafts mad 
        JOIN players p ON mad.player_id = p.id 
        JOIN teams t ON p.team_id = t.id
        WHERE mad.match_id = ? AND mad.profile_id = ?
        ORDER BY p.team_id, p.last_name
      `,
      )
        .bind(match_id, planillero2.profile_id)
        .all(),

      env.DB.prepare(
        `
        SELECT ed.*, p.first_name, p.last_name, p.team_id, t.name as team_name
        FROM event_drafts ed 
        JOIN players p ON ed.player_id = p.id 
        JOIN teams t ON p.team_id = t.id
        WHERE ed.match_id = ? AND ed.profile_id = ?
        ORDER BY ed.minute, ed.type
      `,
      )
        .bind(match_id, planillero1.profile_id)
        .all(),

      env.DB.prepare(
        `
        SELECT ed.*, p.first_name, p.last_name, p.team_id, t.name as team_name
        FROM event_drafts ed 
        JOIN players p ON ed.player_id = p.id 
        JOIN teams t ON p.team_id = t.id
        WHERE ed.match_id = ? AND ed.profile_id = ?
        ORDER BY ed.minute, ed.type
      `,
      )
        .bind(match_id, planillero2.profile_id)
        .all(),
    ]);

    return {
      planillero1: {
        username: planillero1.username,
        attendance: attendance1.results || [],
        events: events1.results || [],
      },
      planillero2: {
        username: planillero2.username,
        attendance: attendance2.results || [],
        events: events2.results || [],
      },
    };
  } catch (error) {
    console.error(`Error getting match comparison data for match ${match_id}:`, error);
    return null;
  }
}
