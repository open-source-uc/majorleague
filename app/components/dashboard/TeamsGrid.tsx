import { getTeams } from "@/app/actions/teams";
import { Tables } from "@/lib/types/database";

type Team = Tables<"teams">;

export default async function TeamsGrid() {
  const teams = await getTeams();

  if (!teams) return <div>No teams found</div>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team: Team) => (
        <div key={team.id} className="rounded border p-4 shadow-sm">
          <p className="mb-2 text-xs text-gray-700">ID: {team.id}</p>
          <h4 className="text-lg font-semibold">{team.name}</h4>
          <p className="text-gray-400">Major: {team.major || "Not specified"}</p>
          <p className="text-sm text-gray-400">
            Created: {team.created_at ? new Date(team.created_at).toLocaleDateString() : "Unknown"}
          </p>
        </div>
      ))}
    </div>
  );
}
