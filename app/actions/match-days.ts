"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";

import { getAuthStatus } from "@/lib/services/auth";

// Types for match day management
export interface MatchDay {
  date: string;
  competition_id: number;
  competition_name: string;
  matches: MatchWithData[];
  totalEvents: number;
}

export interface MatchWithData {
  id: number;
  local_team_id: number;
  visitor_team_id: number;
  local_team_name: string;
  visitor_team_name: string;
  competition_id: number;
  timestamp: string;
  location: string | null;
  local_score: number;
  visitor_score: number;
  status: string;
  events_count: number;
  lineup_count: number;
  stream_id: number | null;
  stream_url: string | null;
}

// Get all match days grouped by date and competition
export async function getMatchDays(): Promise<MatchDay[]> {
  try {
    const { env } = getRequestContext();

    // Validate environment
    if (!env || !env.DB) {
      console.error("Database environment not available");
      return [];
    }

    const matchesData = await env.DB.prepare(
      `
      SELECT 
        m.id, m.local_team_id, m.visitor_team_id, m.competition_id, m.timestamp, m.location,
        m.local_score, m.visitor_score, m.status,
        COALESCE(lt.name, 'Equipo Local') as local_team_name, 
        COALESCE(vt.name, 'Equipo Visitante') as visitor_team_name,
        COALESCE(c.name, 'Competición') as competition_name,
        substr(m.timestamp, 1, 10) as match_date,
        COUNT(DISTINCT e.id) as events_count,
        COUNT(DISTINCT l.id) as lineup_count,
        NULL as stream_id, NULL as stream_url
      FROM matches m
      LEFT JOIN teams lt ON m.local_team_id = lt.id
      LEFT JOIN teams vt ON m.visitor_team_id = vt.id
      LEFT JOIN competitions c ON m.competition_id = c.id
      LEFT JOIN events e ON m.id = e.match_id
      LEFT JOIN lineups l ON m.id = l.match_id AND l.team_id IN (m.local_team_id, m.visitor_team_id)
      GROUP BY m.id, m.local_team_id, m.visitor_team_id, m.competition_id, m.timestamp, m.location,
               m.local_score, m.visitor_score, m.status, lt.name, vt.name, c.name
      ORDER BY m.timestamp DESC, c.name ASC
      `,
    ).all<MatchWithData & { match_date: string; competition_name: string }>();

    const matches = matchesData.results || [];

    // Group matches by date and competition
    const matchDaysMap = new Map<string, MatchDay>();

    matches.forEach((match: MatchWithData & { match_date: string; competition_name: string }) => {
      // Validate match data
      if (!match.match_date || !match.competition_id) {
        console.warn("Invalid match data:", match);
        return;
      }

      const key = `${match.match_date}-${match.competition_id}`;

      if (!matchDaysMap.has(key)) {
        matchDaysMap.set(key, {
          date: match.match_date,
          competition_id: match.competition_id,
          competition_name: match.competition_name,
          matches: [],
          totalEvents: 0,
        });
      }

      const matchDay = matchDaysMap.get(key)!;
      matchDay.matches.push(match);
      matchDay.totalEvents += match.events_count || 0;
    });

    const result = Array.from(matchDaysMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return result;
  } catch (error) {
    console.error("Error fetching match days:", error);
    return [];
  }
}

// Get detailed data for a specific match day
export async function getMatchDayDetails(
  date: string,
  competitionId: number,
): Promise<{ matches: MatchWithData[]; events: any[] }> {
  try {
    const { env } = getRequestContext();

    // Validate inputs
    if (!date || isNaN(competitionId)) {
      console.error("Invalid parameters:", { date, competitionId });
      return { matches: [] as MatchWithData[], events: [] as any[] };
    }

    // Validate environment
    if (!env || !env.DB) {
      console.error("Database environment not available");
      return { matches: [] as MatchWithData[], events: [] as any[] };
    }

    const matches = await env.DB.prepare(
      `
      SELECT 
        m.id, m.local_team_id, m.visitor_team_id, m.competition_id, m.timestamp, m.location,
        m.local_score, m.visitor_score, m.status,
        COALESCE(lt.name, 'Equipo Local') as local_team_name, 
        COALESCE(vt.name, 'Equipo Visitante') as visitor_team_name,
        0 as events_count, 0 as lineup_count, NULL as stream_id, NULL as stream_url
      FROM matches m
      LEFT JOIN teams lt ON m.local_team_id = lt.id
      LEFT JOIN teams vt ON m.visitor_team_id = vt.id
      WHERE substr(m.timestamp, 1, 10) = ? AND m.competition_id = ?
      ORDER BY m.timestamp ASC
      `,
    )
      .bind(date, competitionId)
      .all<MatchWithData>();

    const matchResults = matches.results || [];

    // Get events for all matches on this day
    const matchIds = matchResults.map((m: MatchWithData) => m.id).filter((id: number) => id != null);

    if (matchIds.length === 0) {
      return { matches: matchResults, events: [] as any[] };
    }

    // Create safe placeholder string for IN clause
    const placeholders = matchIds.map(() => "?").join(",");

    const events = await env.DB.prepare(
      `
      SELECT 
        e.id, e.match_id, e.team_id, e.type, e.minute, e.description, e.created_at,
        COALESCE(p.first_name || ' ' || p.last_name, 'Jugador') as player_name,
        COALESCE(p.nickname, '') as player_nickname,
        COALESCE(t.name, 'Equipo') as team_name
      FROM events e
      LEFT JOIN event_players ep ON e.id = ep.event_id AND ep.role = 'main'
      LEFT JOIN players p ON ep.player_id = p.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE e.match_id IN (${placeholders})
      ORDER BY e.match_id, e.minute ASC
      `,
    )
      .bind(...matchIds)
      .all();

    return {
      matches: matchResults,
      events: (events.results || []) as any[],
    };
  } catch (error) {
    console.error("Error fetching match day details:", error);
    return { matches: [] as MatchWithData[], events: [] as any[] };
  }
}

// Bulk operations for match days
export async function bulkUpdateMatchStatus(_prev: any, formData: FormData) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar partidos",
    };
  }

  const matchIds = JSON.parse(formData.get("match_ids") as string);
  const newStatus = formData.get("status") as string;

  if (!matchIds || !Array.isArray(matchIds) || !newStatus) {
    return {
      success: 0,
      errors: 1,
      message: "Datos inválidos",
    };
  }

  const { env } = getRequestContext();

  try {
    const placeholders = matchIds.map(() => "?").join(",");
    await env.DB.prepare(
      `UPDATE matches SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id IN (${placeholders})`,
    )
      .bind(newStatus, ...matchIds)
      .run();

    revalidatePath("/dashboard/match-days");

    return {
      success: 1,
      errors: 0,
      message: `${matchIds.length} partidos actualizados a "${newStatus}"`,
    };
  } catch (error) {
    console.error("Error bulk updating matches:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar los partidos",
    };
  }
}

// Create a complete match day (4 matches typically)
export async function createMatchDay(_prev: any, formData: FormData) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear partidos",
    };
  }

  const date = formData.get("date") as string;
  const competitionId = parseInt(formData.get("competition_id") as string);
  const location = formData.get("location") as string;
  const teams = JSON.parse(formData.get("team_pairs") as string); // Array of team pairs

  if (!date || !competitionId || !teams || !Array.isArray(teams)) {
    return {
      success: 0,
      errors: 1,
      message: "Datos inválidos para crear la jornada",
    };
  }

  const { env } = getRequestContext();

  try {
    let createdCount = 0;

    for (let i = 0; i < teams.length; i++) {
      const { local_team_id, visitor_team_id, time } = teams[i];
      const timestamp = `${date} ${time}:00`;

      await env.DB.prepare(
        `INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, location, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'scheduled', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      )
        .bind(local_team_id, visitor_team_id, competitionId, timestamp, location || null)
        .run();

      createdCount++;
    }

    revalidatePath("/dashboard/match-days");

    return {
      success: 1,
      errors: 0,
      message: `Jornada creada exitosamente con ${createdCount} partidos`,
    };
  } catch (error) {
    console.error("Error creating match day:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear la jornada",
    };
  }
}
