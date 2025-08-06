import { getTeamCompetitionsByYearAndSemester } from "@/actions/positions";
import PositionsTable from "@/components/data/PositionsTable";

export const runtime = "edge";

export default async function PosicionesPage({ params }: { params: Promise<{ year: string; semester: string }> }) {
  const { year, semester } = await params;
  const teamCompetitions = await getTeamCompetitionsByYearAndSemester(parseInt(year), parseInt(semester));

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-5 py-15 lg:flex-row">
        {teamCompetitions.length > 0 ? (
          <>
            <PositionsTable year={year} semester={semester} teamCompetitions={teamCompetitions} />
          </>
        ) : (
          <div>No hay una tabla de posiciones para este año y semestre</div>
        )}
      </div>
    </>
  );
}
