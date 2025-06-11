import { getCompetitions } from "@/app/actions/competitions";
import { Tables } from "@/lib/types/database";

type Competition = Tables<"competitions">;

export default async function CompetitionsGrid() {
  const competitions = await getCompetitions();

  if (!competitions) return <div>No competitions found</div>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {competitions.map((competition: Competition) => (
        <div key={competition.id} className="rounded border p-4 shadow-sm">
          <p className="mb-2 text-xs text-gray-700">ID: {competition.id}</p>
          <h4 className="text-lg font-semibold">{competition.name}</h4>
          <p className="text-gray-400">Year: {competition.year}</p>
          <p className="text-gray-400">Semester: {competition.semester || "Not specified"}</p>
          <p className="text-sm text-gray-400">Start: {competition.start_date || "TBD"}</p>
          <p className="text-sm text-gray-400">End: {competition.end_date || "TBD"}</p>
        </div>
      ))}
    </div>
  );
}
