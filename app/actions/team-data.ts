"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";

import type { Player, Team, TeamPage } from "@/lib/types";

export interface TeamPlayer extends Player {
  team_name?: string;
  profile_username?: string;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    goals: number;
    yellowCards: number;
    redCards: number;
  };
}

export interface TeamStats {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TeamMatch {
  id: number;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  type: "home" | "away";
  status: "scheduled" | "live" | "finished" | "cancelled";
  local_score?: number;
  visitor_score?: number;
}

export interface TeamPhoto {
  id: number;
  team_id: number;
  url: string;
  caption?: string;
  order_index: number;
  created_at?: string;
}

export interface CompleteTeamData {
  team: Team;
  teamPage: TeamPage | null;
  players: TeamPlayer[];
  stats: TeamStats;
  upcomingMatches: TeamMatch[];
  finishedMatches: TeamMatch[];
  photos: TeamPhoto[];
}

// Get team players
export async function getTeamPlayers(teamId: number): Promise<TeamPlayer[]> {
  const { env } = getRequestContext();

  const players = await env.DB.prepare(
    `
    SELECT 
      p.id, p.team_id, p.profile_id, p.first_name, p.last_name, 
      p.nickname, p.birthday, p.position, p.jersey_number,
      p.created_at, p.updated_at,
      pr.username as profile_username,
      
      -- Game statistics
      COUNT(DISTINCT ma.match_id) as games_played,
      COUNT(DISTINCT CASE WHEN m.status = 'finished' AND 
        ((m.local_team_id = p.team_id AND m.local_score > m.visitor_score) OR
         (m.visitor_team_id = p.team_id AND m.visitor_score > m.local_score))
        THEN ma.match_id END) as wins,
      COUNT(DISTINCT CASE WHEN m.status = 'finished' AND 
        ((m.local_team_id = p.team_id AND m.local_score < m.visitor_score) OR
         (m.visitor_team_id = p.team_id AND m.visitor_score < m.local_score))
        THEN ma.match_id END) as losses,
      COUNT(DISTINCT CASE WHEN m.status = 'finished' AND m.local_score = m.visitor_score
        THEN ma.match_id END) as draws,
        
      -- Goal statistics
      COUNT(CASE WHEN e.type = 'goal' AND ep.role = 'main' THEN 1 END) as goals,
      COUNT(CASE WHEN e.type = 'yellow_card' AND ep.role = 'main' THEN 1 END) as yellow_cards,
      COUNT(CASE WHEN e.type = 'red_card' AND ep.role = 'main' THEN 1 END) as red_cards
      
    FROM players p
    LEFT JOIN profiles pr ON p.profile_id = pr.id
    LEFT JOIN match_attendance ma ON p.id = ma.player_id AND ma.status = 'present'
    LEFT JOIN matches m ON ma.match_id = m.id
    LEFT JOIN events e ON e.match_id = m.id AND e.team_id = p.team_id
    LEFT JOIN event_players ep ON e.id = ep.event_id AND ep.player_id = p.id
    
    WHERE p.team_id = ?
    GROUP BY p.id
    ORDER BY p.jersey_number ASC, p.last_name ASC
  `,
  )
    .bind(teamId)
    .all<any>();

  return (players.results || []).map((player) => ({
    id: player.id,
    team_id: player.team_id,
    profile_id: player.profile_id,
    first_name: player.first_name,
    last_name: player.last_name,
    nickname: player.nickname,
    birthday: player.birthday,
    position: player.position as "GK" | "DEF" | "MID" | "FWD",
    jersey_number: player.jersey_number,
    created_at: player.created_at,
    updated_at: player.updated_at,
    profile_username: player.profile_username,
    stats: {
      gamesPlayed: player.games_played || 0,
      wins: player.wins || 0,
      losses: player.losses || 0,
      draws: player.draws || 0,
      goals: player.goals || 0,
      yellowCards: player.yellow_cards || 0,
      redCards: player.red_cards || 0,
    },
  }));
}

// Get team statistics from competitions
export async function getTeamStats(teamId: number): Promise<TeamStats> {
  const { env } = getRequestContext();

  const stats = await env.DB.prepare(
    `
    SELECT 
      COALESCE(SUM(tc.pj), 0) as total_games,
      COALESCE(SUM(tc.g), 0) as wins,
      COALESCE(SUM(tc.e), 0) as draws,
      COALESCE(SUM(tc.p), 0) as losses,
      COALESCE(SUM(tc.gf), 0) as goals_for,
      COALESCE(SUM(tc.gc), 0) as goals_against,
      COALESCE(SUM(tc.dg), 0) as goal_difference,
      COALESCE(SUM(tc.points), 0) as points
    FROM team_competitions tc
    WHERE tc.team_id = ?
  `,
  )
    .bind(teamId)
    .first<any>();

  return {
    totalGames: stats?.total_games || 0,
    wins: stats?.wins || 0,
    draws: stats?.draws || 0,
    losses: stats?.losses || 0,
    goalsFor: stats?.goals_for || 0,
    goalsAgainst: stats?.goals_against || 0,
    goalDifference: stats?.goal_difference || 0,
    points: stats?.points || 0,
  };
}

// Get team upcoming matches
export async function getTeamUpcomingMatches(teamId: number, limit: number = 5): Promise<TeamMatch[]> {
  const { env } = getRequestContext();

  const matches = await env.DB.prepare(
    `
    SELECT 
      m.id,
      m.timestamp,
      m.location,
      m.status,
      m.local_score,
      m.visitor_score,
      CASE 
        WHEN m.local_team_id = ? THEN vt.name
        ELSE lt.name
      END as opponent,
      CASE 
        WHEN m.local_team_id = ? THEN 'home'
        ELSE 'away'
      END as type
    FROM matches m
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    WHERE (m.local_team_id = ? OR m.visitor_team_id = ?)
      AND m.timestamp >= datetime('now')
      AND m.status IN ('scheduled', 'live')
    ORDER BY m.timestamp ASC
    LIMIT ?
  `,
  )
    .bind(teamId, teamId, teamId, teamId, limit)
    .all<any>();

  return (matches.results || []).map((match) => {
    const matchDate = new Date(match.timestamp);
    return {
      id: match.id,
      opponent: match.opponent || "TBD",
      date: matchDate.toISOString().split("T")[0],
      time: matchDate.toTimeString().slice(0, 5),
      venue: match.location || "Por definir",
      type: match.type as "home" | "away",
      status: match.status as "scheduled" | "live" | "finished" | "cancelled",
      local_score: match.local_score,
      visitor_score: match.visitor_score,
    };
  });
}

// Get team photos (will be implemented after creating table)
export async function getTeamPhotos(teamId: number): Promise<TeamPhoto[]> {
  const { env } = getRequestContext();

  try {
    const photos = await env.DB.prepare(
      `
      SELECT id, team_id, url, caption, order_index, created_at
      FROM team_photos
      WHERE team_id = ?
      ORDER BY order_index ASC, created_at DESC
    `,
    )
      .bind(teamId)
      .all<TeamPhoto>();

    return photos.results || [];
  } catch (error) {
    return [];
  }
}

export async function getCompleteTeamDataByCaptainId(captainId: string): Promise<CompleteTeamData | null> {
  try {
    if (!captainId) {
      return null;
    }
    const { env } = getRequestContext();
    const teamId = await env.DB.prepare(
      `
      SELECT id FROM teams WHERE captain_id = ?
    `,
    )
      .bind(captainId)
      .first<{ id: number }>();
    if (!teamId) {
      return null;
    }
    return getCompleteTeamData(teamId.id);
  } catch (error) {
    console.error("Error fetching complete team data by captain id:", error);
    return null;
  }
}

// Get all team matches
export async function getAllTeamMatches(teamId: number): Promise<{ upcoming: TeamMatch[]; finished: TeamMatch[] }> {
  const { env } = getRequestContext();

  const matches = await env.DB.prepare(
    `
    SELECT 
      m.id,
      m.timestamp,
      m.location,
      m.status,
      m.local_score,
      m.visitor_score,
      CASE 
        WHEN m.local_team_id = ? THEN vt.name
        ELSE lt.name
      END as opponent,
      CASE 
        WHEN m.local_team_id = ? THEN 'home'
        ELSE 'away'
      END as type
    FROM matches m
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    WHERE (m.local_team_id = ? OR m.visitor_team_id = ?)
      AND m.status IN ('scheduled', 'live', 'finished')
    ORDER BY m.timestamp ASC
  `,
  )
    .bind(teamId, teamId, teamId, teamId)
    .all<any>();

  const allMatches = (matches.results || []).map((match) => {
    const matchDate = new Date(match.timestamp);
    return {
      id: match.id,
      opponent: match.opponent || "TBD",
      date: matchDate.toISOString().split("T")[0],
      time: matchDate.toTimeString().slice(0, 5),
      venue: match.location || "Por definir",
      type: match.type as "home" | "away",
      status: match.status as "scheduled" | "live" | "finished" | "cancelled",
      local_score: match.local_score,
      visitor_score: match.visitor_score,
    };
  });

  // Separate upcoming and finished matches
  const upcoming = allMatches.filter((match) => match.status === "scheduled" || match.status === "live").slice(0, 5); // Limit to 5 upcoming matches

  const finished = allMatches.filter((match) => match.status === "finished").slice(-5); // Get last 5 finished matches

  return { upcoming, finished };
}

// Get complete team data with optimized queries (reduced from 7 to 4 queries)
export async function getCompleteTeamData(teamId: number): Promise<CompleteTeamData | null> {
  try {
    const { env } = getRequestContext();

    // Combined team info and team page query
    const teamData = await env.DB.prepare(
      `
      SELECT 
        t.id, t.name, t.captain_id, t.major, t.created_at as team_created_at, t.updated_at as team_updated_at,
        p.username as captain_username,
        tp.id as page_id, tp.description, tp.instagram_handle, tp.captain_email,
        tp.founded_year, tp.achievements, tp.motto, 
        tp.created_at as page_created_at, tp.updated_at as page_updated_at
      FROM teams t
      LEFT JOIN profiles p ON t.captain_id = p.id
      LEFT JOIN team_pages tp ON t.id = tp.team_id
      WHERE t.id = ?
    `,
    )
      .bind(teamId)
      .first<any>();

    if (!teamData) return null;

    // Get all other data in parallel (now only 4 queries total instead of 7)
    const [players, stats, matches, photos] = await Promise.all([
      getTeamPlayers(teamId),
      getTeamStats(teamId),
      getAllTeamMatches(teamId),
      getTeamPhotos(teamId),
    ]);

    return {
      team: {
        id: teamData.id,
        name: teamData.name,
        captain_id: teamData.captain_id,
        captain_username: teamData.captain_username,
        major: teamData.major,
        created_at: teamData.team_created_at,
        updated_at: teamData.team_updated_at,
      },
      teamPage: teamData.page_id
        ? {
            id: teamData.page_id,
            team_id: teamData.id,
            description: teamData.description,
            instagram_handle: teamData.instagram_handle,
            captain_email: teamData.captain_email,
            founded_year: teamData.founded_year,
            achievements: teamData.achievements,
            motto: teamData.motto,
            created_at: teamData.page_created_at,
            updated_at: teamData.page_updated_at,
          }
        : null,
      players,
      stats,
      upcomingMatches: matches.upcoming,
      finishedMatches: matches.finished,
      photos,
    };
  } catch (error) {
    console.error("Error fetching complete team data:", error);
    return null;
  }
}

// Helper function to find team by slug
export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const { env } = getRequestContext();

  const teams = await env.DB.prepare(
    `
    SELECT t.id, t.name, t.captain_id, t.major, t.created_at, t.updated_at,
           p.username as captain_username
    FROM teams t
    LEFT JOIN profiles p ON t.captain_id = p.id
    ORDER BY t.name ASC
  `,
  ).all<Team & { captain_username?: string }>();

  const team = (teams.results || []).find(
    (team) =>
      team.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") === slug || team.name.toLowerCase().replace(/\s+/g, "-") === slug,
  );

  return team
    ? {
        id: team.id,
        name: team.name,
        captain_id: team.captain_id,
        captain_username: team.captain_username,
        major: team.major,
        created_at: team.created_at,
        updated_at: team.updated_at,
      }
    : null;
}
