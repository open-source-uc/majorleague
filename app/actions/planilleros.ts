"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";

// Types
export interface MatchPlanillero {
  id: number;
  match_id: number;
  team_id: number;
  profile_id: string;
  status: "assigned" | "in_progress" | "completed";
  created_at?: string;
  updated_at?: string;
}

export interface ScorecardValidation {
  id: number;
  match_id: number;
  validator_profile_id: string;
  validated_team_id: number;
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

// Base schemas
const baseIdSchema = {
  match_id: z.number().min(1),
  team_id: z.number().min(1),
  player_id: z.number().min(1),
  profile_id: z.string().min(1),
};

const attendanceStatusSchema = z.enum(["present", "absent", "substitute"]);
const validationStatusSchema = z.enum(["approved", "rejected"]);
const jerseyNumberSchema = z.number().min(1).max(99).optional();

// Schemas de validación
const assignPlanilleroSchema = z.object({
  match_id: baseIdSchema.match_id,
  team_id: baseIdSchema.team_id,
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
  updates: z.array(z.object({
    player_id: baseIdSchema.player_id,
    status: attendanceStatusSchema,
    jersey_number: jerseyNumberSchema,
  })).min(1),
});

const validationUpdateSchema = z.object({
  match_id: baseIdSchema.match_id,
  validated_team_id: baseIdSchema.team_id,
  status: validationStatusSchema,
  comments: z.string().optional(),
});

// Unified response helpers
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

export async function getPlanilleroMatches(profile_id: string, status?: string | string[]) {
  try {
    const { env } = getRequestContext();

    let query = `
      SELECT 
        m.*, 
        lt.name as local_team_name,
        vt.name as visitor_team_name,
        mp.status as planillero_status,
        mp.team_id as my_team_id
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
      query += ` AND m.status IN ('scheduled', 'live', 'in_review')`;
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
  live: any[];
  in_review: any[];
  scheduled: any[];
}> {
  try {
    const { env } = getRequestContext();

    const query = `
      SELECT 
        m.*, 
        lt.name as local_team_name,
        vt.name as visitor_team_name,
        mp.status as planillero_status,
        mp.team_id as my_team_id,
        m.status as match_status
      FROM matches m
      JOIN teams lt ON m.local_team_id = lt.id
      JOIN teams vt ON m.visitor_team_id = vt.id
      JOIN match_planilleros mp ON m.id = mp.match_id
      WHERE mp.profile_id = ?
        AND m.status IN ('scheduled', 'live', 'in_review')
      ORDER BY 
        CASE m.status 
          WHEN 'live' THEN 1 
          WHEN 'in_review' THEN 2 
          WHEN 'scheduled' THEN 3 
          ELSE 4 
        END,
        m.timestamp ASC`;

    const matches = await env.DB.prepare(query).bind(profile_id).all();
    const results = matches.results || [];

    const grouped = {
      live: results.filter((m: any) => m.match_status === "live"),
      in_review: results.filter((m: any) => m.match_status === "in_review"),
      scheduled: results.filter((m: any) => m.match_status === "scheduled"),
    };

    return grouped;
  } catch (error) {
    console.error(`Error getting grouped planillero matches for profile ${profile_id}:`, error);
    return {
      live: [],
      in_review: [],
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

export async function getScorecardValidations(match_id: number) {
  try {
    const { env } = getRequestContext();
    const validations = await env.DB.prepare(
      `
      SELECT 
        sv.*,
        p.username as validator_username,
        t.name as validated_team_name
      FROM scorecard_validations sv
      JOIN profiles p ON sv.validator_profile_id = p.id
      JOIN teams t ON sv.validated_team_id = t.id
      WHERE sv.match_id = ?
    `,
    )
      .bind(match_id)
      .all();

    return validations.results || [];
  } catch (error) {
    console.error(`Error getting scorecard validations for match ${match_id}:`, error);
    return [];
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

    if (!planilleroInfo) {
      return null;
    }

    const myTeamId = planilleroInfo.team_id as number;
    const rivalTeamId = myTeamId === planilleroInfo.local_team_id ? planilleroInfo.visitor_team_id : planilleroInfo.local_team_id;

    const [myTeamPlayers, myTeamAttendance, validations, myTeamEvents, rivalEvents] = await Promise.all([
      env.DB.prepare(`SELECT * FROM players WHERE team_id = ? ORDER BY position, last_name ASC`).bind(myTeamId).all(),
      env.DB.prepare(`
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
      `).bind(match_id, myTeamId).all(),
      env.DB.prepare(`
        SELECT 
          sv.*,
          p.username as validator_username,
          t.name as validated_team_name
        FROM scorecard_validations sv
        JOIN profiles p ON sv.validator_profile_id = p.id
        JOIN teams t ON sv.validated_team_id = t.id
        WHERE sv.match_id = ?
      `).bind(match_id).all(),
      env.DB.prepare(`
        SELECT 
          e.*,
          COALESCE(
            GROUP_CONCAT(p.first_name || ' ' || p.last_name, ', '), 
            'Sin jugador'
          ) as player_name
        FROM events e
        LEFT JOIN event_players ep ON e.id = ep.event_id AND ep.role = 'main'
        LEFT JOIN players p ON ep.player_id = p.id
        WHERE e.match_id = ? AND e.team_id = ?
        GROUP BY e.id ORDER BY e.minute ASC
      `).bind(match_id, myTeamId).all(),
      env.DB.prepare(`
        SELECT 
          e.*,
          COALESCE(
            GROUP_CONCAT(p.first_name || ' ' || p.last_name, ', '), 
            'Sin jugador'
          ) as player_name
        FROM events e
        LEFT JOIN event_players ep ON e.id = ep.event_id AND ep.role = 'main'
        LEFT JOIN players p ON ep.player_id = p.id
        WHERE e.match_id = ? AND e.team_id = ?
        GROUP BY e.id ORDER BY e.minute ASC
      `).bind(match_id, rivalTeamId).all()
    ]);

    const playersWithAttendance = (myTeamPlayers.results || []).map((player: any) => {
      const attendance = (myTeamAttendance.results || []).find((a: any) => a.player_id === player.id);
      return {
        ...player,
        attendance_status: attendance?.status || "absent",
        jersey_number: attendance?.jersey_number || player.jersey_number,
      };
    });

    return {
      planilleroInfo: planilleroInfo as any,
      myTeamId,
      rivalTeamId,
      myTeamPlayers: myTeamPlayers.results || [],
      myTeamAttendance: myTeamAttendance.results || [],
      validations: validations.results || [],
      myTeamEvents: myTeamEvents.results || [],
      rivalEvents: rivalEvents.results || [],
      playersWithAttendance,
      myTeamName: (myTeamId === planilleroInfo.local_team_id ? planilleroInfo.local_team_name : planilleroInfo.visitor_team_name) as string,
      rivalTeamName: (rivalTeamId === planilleroInfo.local_team_id ? planilleroInfo.local_team_name : planilleroInfo.visitor_team_name) as string,
    };
  } catch (error) {
    console.error(`Error getting match planillero data for match ${match_id}, profile ${profile_id}:`, error);
    return null;
  }
}

interface AuthValidationOptions {
  requiredMatchStatuses?: string[];
  requiredTeamId?: number;
  requirePlayerAccess?: boolean;
}

async function validatePlanilleroAuth(
  match_id: number,
  profile_id: string,
  options: AuthValidationOptions = {}
) {
  const { 
    requiredMatchStatuses = ["live", "in_review"],
    requiredTeamId,
    requirePlayerAccess = false
  } = options;

  const { env } = getRequestContext();

  let query = `
    SELECT mp.id, mp.team_id, m.local_team_id, m.visitor_team_id, m.status
    FROM match_planilleros mp
    JOIN matches m ON mp.match_id = m.id
    WHERE mp.match_id = ? AND mp.profile_id = ?`;

  const params = [match_id, profile_id];

  if (requiredMatchStatuses.length > 0) {
    const placeholders = requiredMatchStatuses.map(() => "?").join(", ");
    query += ` AND m.status IN (${placeholders})`;
    params.push(...requiredMatchStatuses);
  }

  if (requiredTeamId !== undefined) {
    query += ` AND mp.team_id = ?`;
    params.push(requiredTeamId);
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
    team_id: parseInt(formData.get("team_id") as string),
    profile_id: formData.get("profile_id") as string,
  };

  const parsed = assignPlanilleroSchema.safeParse(body);
  if (!parsed.success) {
    return createResponse(false, "Datos inválidos");
  }

  try {
    const { env } = getRequestContext();
    const match = await env.DB.prepare(
      `SELECT local_team_id, visitor_team_id FROM matches WHERE id = ?`
    ).bind(parsed.data.match_id).first();

    if (!match) {
      return createResponse(false, "El partido no existe");
    }

    if (parsed.data.team_id !== match.local_team_id && parsed.data.team_id !== match.visitor_team_id) {
      return createResponse(false, "El equipo seleccionado no participa en este partido");
    }

    const existingPlanillero = await env.DB.prepare(
      `SELECT id FROM match_planilleros WHERE match_id = ? AND team_id = ?`
    ).bind(parsed.data.match_id, parsed.data.team_id).first();

    if (existingPlanillero) {
      return createResponse(false, "Ya hay un planillero asignado a este equipo para este partido");
    }

    await env.DB.prepare(
      `INSERT INTO match_planilleros (match_id, team_id, profile_id) VALUES (?, ?, ?)`
    ).bind(parsed.data.match_id, parsed.data.team_id, parsed.data.profile_id).run();

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
  const team_id = parseInt(formData.get("team_id") as string);

  if (!match_id || !team_id) {
    return { success: 0, errors: 1, message: "Datos inválidos" };
  }

  const { env } = getRequestContext();
  try {
    const existingPlanillero = await env.DB.prepare(
      `SELECT id, profile_id FROM match_planilleros WHERE match_id = ? AND team_id = ?`
    ).bind(match_id, team_id).first();

    if (!existingPlanillero) {
      return { 
        success: 0, 
        errors: 1, 
        message: "No hay planillero asignado para este equipo en este partido" 
      };
    }

    await env.DB.prepare(
      `DELETE FROM match_planilleros WHERE match_id = ? AND team_id = ?`
    ).bind(match_id, team_id).run();

    await env.DB.prepare(
      `DELETE FROM match_attendance WHERE match_id = ? AND player_id IN (
        SELECT id FROM players WHERE team_id = ?
      )`
    ).bind(match_id, team_id).run();

    await env.DB.prepare(
      `DELETE FROM scorecard_validations WHERE match_id = ? AND (
        validator_profile_id = ? OR validated_team_id = ?
      )`
    ).bind(match_id, existingPlanillero.profile_id, team_id).run();

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
    team_id: parseInt(formData.get("team_id") as string),
    new_profile_id: formData.get("new_profile_id") as string,
  };

  if (!body.match_id || !body.team_id || !body.new_profile_id) {
    return { success: 0, errors: 1, message: "Datos inválidos" };
  }

  const { env } = getRequestContext();
  try {
    const existingPlanillero = await env.DB.prepare(
      `SELECT id, profile_id FROM match_planilleros WHERE match_id = ? AND team_id = ?`
    ).bind(body.match_id, body.team_id).first();

    if (!existingPlanillero) {
      return { 
        success: 0, 
        errors: 1, 
        message: "No hay planillero asignado para este equipo en este partido" 
      };
    }

    const conflictingAssignment = await env.DB.prepare(
      `SELECT id FROM match_planilleros WHERE match_id = ? AND profile_id = ?`
    ).bind(body.match_id, body.new_profile_id).first();

    if (conflictingAssignment) {
      return { 
        success: 0, 
        errors: 1, 
        message: "El planillero seleccionado ya está asignado a este partido" 
      };
    }

    await env.DB.prepare(
      `UPDATE match_planilleros 
       SET profile_id = ?, status = 'assigned', updated_at = CURRENT_TIMESTAMP 
       WHERE match_id = ? AND team_id = ?`
    ).bind(body.new_profile_id, body.match_id, body.team_id).run();

    await env.DB.prepare(
      `DELETE FROM match_attendance WHERE match_id = ? AND player_id IN (
        SELECT id FROM players WHERE team_id = ?
      )`
    ).bind(body.match_id, body.team_id).run();

    await env.DB.prepare(
      `DELETE FROM scorecard_validations WHERE match_id = ? AND (
        validator_profile_id = ? OR validated_team_id = ?
      )`
    ).bind(body.match_id, existingPlanillero.profile_id, body.team_id).run();

    revalidatePath("/dashboard/planilleros");
    return { success: 1, errors: 0, message: "Planillero cambiado exitosamente" };
  } catch (error) {
    console.error(`Error changing planillero for match ${body.match_id}:`, error);
    return { success: 0, errors: 1, message: "Error interno del servidor. Por favor, inténtelo nuevamente." };
  }
}

export async function updateAttendance(_prev: any, formData: FormData) {
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
      requiredMatchStatuses: ["scheduled", "live", "in_review"]
    });

    if (!authCheck) {
      return { success: 0, errors: 1, message: "No autorizado para este partido" };
    }

    const { env } = getRequestContext();
    const playerTeamCheck = await env.DB.prepare(
      `
      SELECT id FROM players WHERE id = ? AND team_id = ?
    `,
    )
      .bind(parsed.data.player_id, authCheck.team_id)
      .first();

    if (!playerTeamCheck) {
      return { success: 0, errors: 1, message: "No autorizado para este jugador" };
    }

    await env.DB.prepare(
      `
      INSERT INTO match_attendance (match_id, player_id, status, jersey_number)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(match_id, player_id) DO UPDATE SET
        status = excluded.status,
        jersey_number = excluded.jersey_number,
        updated_at = CURRENT_TIMESTAMP
    `,
    )
      .bind(parsed.data.match_id, parsed.data.player_id, parsed.data.status, parsed.data.jersey_number || null)
      .run();

    revalidatePath(`/planillero/partido/${parsed.data.match_id}`);
    return { success: 1, errors: 0, message: "Asistencia actualizada" };
  } catch (error) {
    console.error("Error updating attendance:", error);
    return { success: 0, errors: 1, message: "Error al actualizar asistencia" };
  }
}

export async function updateBulkAttendance(_prev: any, formData: FormData) {
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
      requiredMatchStatuses: ["scheduled", "live", "in_review"]
    });

    if (!authCheck) {
      return { success: 0, errors: 1, message: "No autorizado para este partido" };
    }

    const { env } = getRequestContext();

    const playerIds = parsed.data.updates.map((u) => u.player_id);
    const validPlayers = await env.DB.prepare(
      `
      SELECT id FROM players 
      WHERE id IN (${playerIds.map(() => "?").join(",")}) 
      AND team_id = ?
    `,
    )
      .bind(...playerIds, authCheck.team_id)
      .all();

    if (validPlayers.results?.length !== playerIds.length) {
      return { success: 0, errors: 1, message: "Algunos jugadores no pertenecen a tu equipo" };
    }

    const statements = parsed.data.updates.map((update) =>
      env.DB.prepare(
        `
        INSERT INTO match_attendance (match_id, player_id, status, jersey_number)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(match_id, player_id) DO UPDATE SET
          status = excluded.status,
          jersey_number = excluded.jersey_number,
          updated_at = CURRENT_TIMESTAMP
      `,
      ).bind(parsed.data.match_id, update.player_id, update.status, update.jersey_number || null),
    );

    await env.DB.batch(statements);

    revalidatePath(`/planillero/partido/${parsed.data.match_id}`);
    return { success: 1, errors: 0, message: `Asistencia actualizada para ${updates.length} jugadores` };
  } catch (error) {
    console.error(`Error updating bulk attendance for match ${parsed.data.match_id}:`, error);
    return {
      success: 0,
      errors: 1,
      message: "Error interno del servidor al actualizar asistencia. Por favor, inténtelo nuevamente.",
    };
  }
}

export async function validateScorecard(_prev: any, formData: FormData) {
  const { isAuthenticated, userProfile } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    return { success: 0, errors: 1, message: "No autorizado" };
  }

  const body = {
    match_id: parseInt(formData.get("match_id") as string),
    validated_team_id: parseInt(formData.get("validated_team_id") as string),
    status: formData.get("status") as string,
    comments: (formData.get("comments") as string) || undefined,
  };

  const parsed = validationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return { success: 0, errors: 1, message: "Datos inválidos" };
  }

  const { env } = getRequestContext();

  try {
    const authCheck = await validatePlanilleroAuth(parsed.data.match_id, userProfile.id, {
      requiredMatchStatuses: ["in_review"]
    });

    if (!authCheck || authCheck.team_id === parsed.data.validated_team_id) {
      return { success: 0, errors: 1, message: "Solo el planillero rival puede validar esta planilla" };
    }

    await env.DB.prepare(
      `
      INSERT INTO scorecard_validations 
      (match_id, validator_profile_id, validated_team_id, status, comments, validated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(match_id, validator_profile_id, validated_team_id) DO UPDATE SET
        status = excluded.status,
        comments = excluded.comments,
        validated_at = excluded.validated_at
    `,
    )
      .bind(
        parsed.data.match_id,
        userProfile.id,
        parsed.data.validated_team_id,
        parsed.data.status,
        parsed.data.comments || null,
      )
      .run();

    if (parsed.data.status === "rejected") {
      await env.DB.prepare(
        `UPDATE match_planilleros 
         SET status = 'assigned' 
         WHERE match_id = ? AND team_id = ? AND status = 'completed'`
      ).bind(parsed.data.match_id, parsed.data.validated_team_id).run();
    }

    revalidatePath(`/planillero/partido/${parsed.data.match_id}`);
    return { 
      success: 1, 
      errors: 0, 
      message: parsed.data.status === "approved" 
        ? "Planilla aprobada exitosamente" 
        : "Planilla rechazada. El equipo puede realizar correcciones y reenviar." 
    };
  } catch (error) {
    console.error(`Error validating scorecard for match ${parsed.data.match_id}:`, error);
    return {
      success: 0,
      errors: 1,
      message: "Error interno del servidor al procesar validación. Por favor, inténtelo nuevamente.",
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
      requiredMatchStatuses: ["scheduled", "live", "in_review"]
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

export async function createEventWithPlayer(_prev: any, formData: FormData) {
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

  const parsed = z.object({
    match_id: baseIdSchema.match_id,
    player_id: baseIdSchema.player_id,
    event_type: z.enum(["goal", "yellow_card", "red_card", "substitution", "other"]),
    minute: z.number().min(0).max(120),
  }).safeParse(body);

  if (!parsed.success) {
    return createResponse(false, "Datos inválidos: " + parsed.error.errors.map((e) => e.message).join(", "));
  }

  try {
    const { env } = getRequestContext();
    
    const authCheck = await env.DB.prepare(`
      SELECT mp.team_id, ma.status as attendance_status
      FROM match_planilleros mp
      JOIN players p ON p.team_id = mp.team_id
      JOIN match_attendance ma ON ma.player_id = p.id AND ma.match_id = mp.match_id
      JOIN matches m ON mp.match_id = m.id
      WHERE mp.match_id = ? AND mp.profile_id = ? AND p.id = ?
        AND m.status IN ('live', 'in_review', 'scheduled') AND ma.status = 'present'
    `).bind(body.match_id, userProfile.id, body.player_id).first();

    if (!authCheck) {
      return createResponse(false, "Jugador no autorizado o no presente");
    }

    const validationCheck = await env.DB.prepare(`
      SELECT status FROM scorecard_validations 
      WHERE match_id = ? AND validated_team_id = ? AND status = 'approved'
    `).bind(body.match_id, authCheck.team_id).first();

    if (validationCheck) {
      return createResponse(false, "No puedes modificar eventos: tu planilla ya ha sido aprobada por el planillero rival");
    }

    const eventResult = await env.DB.prepare(`
      INSERT INTO events (match_id, team_id, type, minute, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(body.match_id, authCheck.team_id, body.event_type, body.minute).run();

    if (!eventResult.meta.last_row_id) {
      throw new Error("Failed to create event");
    }

    await env.DB.prepare(`
      INSERT INTO event_players (event_id, player_id, role, created_at)
      VALUES (?, ?, 'main', CURRENT_TIMESTAMP)
    `).bind(eventResult.meta.last_row_id, body.player_id).run();

    revalidatePath(`/planillero/partido/${body.match_id}`);
    return createResponse(true, "Evento registrado exitosamente");
  } catch (error) {
    return handleActionError(error, `Error creating event for match ${body.match_id}`);
  }
}

export async function markPlanilleroCompleted(match_id: number, profile_id: string) {
  const { env } = getRequestContext();
  try {
    const planilleroInfo = await env.DB.prepare(
      `SELECT team_id FROM match_planilleros WHERE match_id = ? AND profile_id = ?`
    ).bind(match_id, profile_id).first();

    if (!planilleroInfo) {
      throw new Error("Planillero no encontrado");
    }

    await env.DB.prepare(
      `
      UPDATE match_planilleros 
      SET status = 'completed'
      WHERE match_id = ? AND profile_id = ?
    `,
    )
      .bind(match_id, profile_id)
      .run();

    await env.DB.prepare(
      `UPDATE scorecard_validations 
       SET status = 'pending', comments = NULL, validated_at = NULL 
       WHERE match_id = ? AND validated_team_id = ?`
    ).bind(match_id, planilleroInfo.team_id).run();

    const currentMatch = await env.DB.prepare(`SELECT status FROM matches WHERE id = ?`).bind(match_id).first();

    if (currentMatch && currentMatch.status === "live") {
      await env.DB.prepare(`UPDATE matches SET status = 'in_review' WHERE id = ?`).bind(match_id).run();
      
      const planilleros = await env.DB.prepare(
        `SELECT profile_id, team_id FROM match_planilleros WHERE match_id = ?`
      ).bind(match_id).all();
      
      const planillerosList = planilleros.results || [];
      
      for (const planillero of planillerosList) {
        const rivalPlanillero = planillerosList.find(p => p.team_id !== planillero.team_id);
        if (rivalPlanillero) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO scorecard_validations 
            (match_id, validator_profile_id, validated_team_id, status, created_at)
            VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)
          `).bind(match_id, planillero.profile_id, rivalPlanillero.team_id).run();
        }
      }
    }

    revalidatePath(`/planillero/partido/${match_id}`);
    return {
      success: 1,
      errors: 0,
      message: "Planilla completada. El partido está ahora en revisión para validación cruzada.",
    };
  } catch (error) {
    console.error(`Error marking planillero as completed for match ${match_id}:`, error);
    return {
      success: 0,
      errors: 1,
      message: "Error interno del servidor al completar planilla. Por favor, inténtelo nuevamente.",
    };
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
      WHERE m.status IN ('scheduled', 'live')
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
            mp.team_id,
            mp.profile_id,
            p.username,
            CASE 
              WHEN mp.team_id = ? THEN 'local'
              WHEN mp.team_id = ? THEN 'visitor'
            END as team_type
          FROM match_planilleros mp
          JOIN profiles p ON mp.profile_id = p.id
          WHERE mp.match_id = ?
        `,
        )
          .bind(match.local_team_id, match.visitor_team_id, match.id)
          .all();

        const planilleros = planillerosResult.results || [];
        let localPlanillero = null;
        let visitorPlanillero = null;

        planilleros.forEach((planillero: any) => {
          if (planillero.team_type === "local") {
            localPlanillero = planillero;
          } else if (planillero.team_type === "visitor") {
            visitorPlanillero = planillero;
          }
        });

        return {
          ...match,
          local_planillero: localPlanillero,
          visitor_planillero: visitorPlanillero,
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
      WHERE m.status IN ('scheduled', 'live', 'in_review')
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
            mp.team_id,
            mp.profile_id,
            mp.status as planillero_status,
            p.username,
            CASE 
              WHEN mp.team_id = ? THEN 'local'
              WHEN mp.team_id = ? THEN 'visitor'
            END as team_type
          FROM match_planilleros mp
          JOIN profiles p ON mp.profile_id = p.id
          WHERE mp.match_id = ?
        `,
        )
          .bind(match.local_team_id, match.visitor_team_id, match.id)
          .all();

        const planilleros = planillerosResult.results || [];
        let localPlanillero = null;
        let visitorPlanillero = null;

        planilleros.forEach((planillero: any) => {
          if (planillero.team_type === "local") {
            localPlanillero = planillero;
          } else if (planillero.team_type === "visitor") {
            visitorPlanillero = planillero;
          }
        });

        return {
          ...match,
          local_planillero: localPlanillero,
          visitor_planillero: visitorPlanillero,
        };
      }),
    );

    return matchesWithPlanilleros;
  } catch (error) {
    console.error("Error getting all matches with planilleros:", error);
    return [];
  }
}
