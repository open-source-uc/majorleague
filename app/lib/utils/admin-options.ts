import { getRequestContext } from "@cloudflare/next-on-pages";

export interface SelectOption {
  value: string;
  label: string;
}

// Helper function to get teams for select options
export async function getTeamOptions(): Promise<SelectOption[]> {
  const { env } = getRequestContext();
  const teams = await env.DB.prepare(
    `
    SELECT id, name FROM teams ORDER BY name ASC
  `,
  ).all<{ id: number; name: string }>();

  return (
    teams.results?.map((team) => ({
      value: team.id.toString(),
      label: team.name,
    })) || []
  );
}

// Helper function to get competitions for select options
export async function getCompetitionOptions(): Promise<SelectOption[]> {
  const { env } = getRequestContext();
  const competitions = await env.DB.prepare(
    `
    SELECT id, name FROM competitions ORDER BY year DESC, semester DESC
  `,
  ).all<{ id: number; name: string }>();

  return (
    competitions.results?.map((competition) => ({
      value: competition.id.toString(),
      label: competition.name,
    })) || []
  );
}

// Helper function to get profiles for select options
export async function getProfileOptions(): Promise<SelectOption[]> {
  const { env } = getRequestContext();
  const profiles = await env.DB.prepare(
    `
    SELECT id, username FROM profiles ORDER BY username ASC
  `,
  ).all<{ id: string; username: string }>();

  return (
    profiles.results?.map((profile) => ({
      value: profile.id,
      label: profile.username,
    })) || []
  );
}

// Helper function to get matches for select options
export async function getMatchOptions(): Promise<SelectOption[]> {
  const { env } = getRequestContext();
  const matches = await env.DB.prepare(
    `
    SELECT m.id, m.timestamp, lt.name as local_team, vt.name as visitor_team, c.name as competition
    FROM matches m
    LEFT JOIN teams lt ON m.local_team_id = lt.id
    LEFT JOIN teams vt ON m.visitor_team_id = vt.id
    LEFT JOIN competitions c ON m.competition_id = c.id
    ORDER BY m.timestamp DESC
  `,
  ).all<{ id: number; timestamp: string; local_team: string; visitor_team: string; competition: string }>();

  return (
    matches.results?.map((match) => ({
      value: match.id.toString(),
      label: `${match.local_team} vs ${match.visitor_team} - ${match.timestamp} (${match.competition})`,
    })) || []
  );
}

// Helper function to get players for select options
export async function getPlayerOptions(): Promise<SelectOption[]> {
  const { env } = getRequestContext();
  const players = await env.DB.prepare(
    `
    SELECT p.id, p.first_name, p.last_name, t.name as team_name
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    ORDER BY p.first_name ASC, p.last_name ASC
  `,
  ).all<{ id: number; first_name: string; last_name: string; team_name: string }>();

  return (
    players.results?.map((player) => ({
      value: player.id.toString(),
      label: `${player.first_name} ${player.last_name}${player.team_name ? ` (${player.team_name})` : ""}`,
    })) || []
  );
}

export async function getEventOptions(): Promise<SelectOption[]> {
  const { env } = getRequestContext();
  const events = await env.DB.prepare(
    `
    SELECT e.id, e.type, e.minute, m.timestamp, lt.name as local_team, vt.name as visitor_team
    FROM events e
    JOIN matches m ON e.match_id = m.id
    JOIN teams lt ON m.local_team_id = lt.id
    JOIN teams vt ON m.visitor_team_id = vt.id
    ORDER BY m.timestamp DESC, e.minute ASC
  `,
  ).all<{ id: number; type: string; minute: number; timestamp: string; local_team: string; visitor_team: string }>();

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

  return (
    events.results?.map((ev) => ({
      value: ev.id.toString(),
      label: `${typeLabel(ev.type)} ${ev.minute}' — ${ev.local_team} vs ${ev.visitor_team} - ${ev.timestamp}`,
    })) || []
  );
}

// Helper function to get preferences for select options
export async function getPreferenceOptions(): Promise<SelectOption[]> {
  const { env } = getRequestContext();
  const preferences = await env.DB.prepare(
    `
    SELECT p.id, p.type, p.channel, pr.username
    FROM preferences p
    LEFT JOIN profiles pr ON p.profile_id = pr.id
    ORDER BY pr.username ASC, p.type ASC
  `,
  ).all<{ id: number; type: string; channel: string; username: string }>();

  return (
    preferences.results?.map((preference) => ({
      value: preference.id.toString(),
      label: `${preference.username} - ${preference.type} (${preference.channel})`,
    })) || []
  );
}

// Main function to get options by data source
export async function getSelectOptions(dataSource: string): Promise<SelectOption[]> {
  switch (dataSource) {
    case "teams":
      return getTeamOptions();
    case "competitions":
      return getCompetitionOptions();
    case "profiles":
      return getProfileOptions();
    case "matches":
      return getMatchOptions();
    case "players":
      return getPlayerOptions();
    case "events":
      return getEventOptions();
    case "preferences":
      return getPreferenceOptions();
    default:
      return [];
  }
}
