import { getMatches } from "@/app/actions/matches";

interface MatchWithJoins {
  id: string;
  local_team_id: { id: string; name: string } | null;
  visitor_team_id: { id: string; name: string } | null;
  competition_id: { id: string; name: string } | null;
  stream_id: string | null;
  date: string | null;
  match_time: string | null;
  location: string | null;
  local_score: number | null;
  visitor_score: number | null;
  created_at: string | null;
}

export default async function MatchesGrid() {
  const matches = await getMatches();
  if (!matches) return <div>No matches found</div>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match: MatchWithJoins) => (
        <div key={match.id} className="rounded border p-4 shadow-sm">
          <p className="mb-2 text-xs text-gray-700">ID: {match.id}</p>
          <h4 className="text-lg font-semibold">
            {match.local_team_id?.name || "TBD"} vs {match.visitor_team_id?.name || "TBD"}
          </h4>
          <p className="text-gray-400">Competition: {match.competition_id?.name || "TBD"}</p>
          <p className="text-gray-400">Location: {match.location || "TBD"}</p>
          <p className="text-sm text-gray-400">Date: {match.date || "TBD"}</p>
          <p className="text-sm text-gray-400">Time: {match.match_time || "TBD"}</p>
          {(match.local_score !== null || match.visitor_score !== null) && (
            <p className="text-sm text-gray-400">
              Score: {match.local_score ?? 0} - {match.visitor_score ?? 0}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
