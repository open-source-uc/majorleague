import PositionsTable from "@/app/components/data/PositionsTable";
import NextMatches from "@/app/components/home/NextMatches";

export default async function PosicionesPage({ params }: { params: Promise<{ year: string; semester: string }> }) {
  const { year, semester } = await params;

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-5 py-15 lg:flex-row">
        <PositionsTable year={year} semester={semester} />
        <NextMatches />
      </div>
      <div>Fechas anteriores...</div>
    </>
  );
}
