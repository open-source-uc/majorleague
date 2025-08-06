"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";

import type { TeamCompetition } from "@/lib/types";

// Database operations
export async function getTeamCompetitionsByYearAndSemester(
  year: number,
  semester: number,
): Promise<(TeamCompetition & { name: string })[]> {
  const { env } = getRequestContext();
  const teamCompetitions = await env.DB.prepare(
    `
    SELECT t.name, tc.points, tc.position, tc.pj, tc.g, tc.e, tc.p, tc.gf, tc.gc, tc.dg
    FROM team_competitions tc
    LEFT JOIN teams t ON tc.team_id = t.id
    LEFT JOIN competitions c ON tc.competition_id = c.id
    WHERE c.year = ?
    AND c.semester = ?
    ORDER BY tc.points DESC
  `,
  )
    .bind(year, semester)
    .all<TeamCompetition & { name: string }>();

  return teamCompetitions.results || [];
}
