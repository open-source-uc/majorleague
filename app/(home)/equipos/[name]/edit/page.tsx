import { redirect } from "next/navigation";

import { getTeamPhotos } from "@/actions/team-data";
import { getTeamPage } from "@/actions/team-pages";
import { getTeams } from "@/actions/teams";
import TeamPageEditor from "@/components/teams/TeamPageEditor";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function TeamEditPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  // Get all teams from database
  const allTeams = await getTeams();

  // Find team by slug (convert name to match team name pattern)
  const teamName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const team = allTeams.find((team) => team.name.toLowerCase().replace(/\s+/g, "-") === name || team.name === teamName);

  if (!team) {
    redirect("/equipos");
  }

  // Get auth status
  const { isAdmin, userProfile } = await getAuthStatus();

  // Authorization check
  const isCaptain = userProfile?.id === team.captain_id;

  if (!isAdmin && !isCaptain) {
    redirect(`/equipos/${name}?error=unauthorized`);
  }

  // Get team page data and photos
  const [teamPage, photos] = await Promise.all([getTeamPage(team.id), getTeamPhotos(team.id)]);

  return <TeamPageEditor team={team} teamPage={teamPage} photos={photos} />;
}
