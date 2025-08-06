import { getNextMatches } from "@/actions/matches";
import { NextMatch } from "@/lib/types";

export default async function NextMatches() {
  const nextMatches: NextMatch[] = await getNextMatches();

  return nextMatches.length > 0 ? (
    <div className="bg-background flex flex-col gap-6 rounded-lg px-6 py-4 md:px-12">
      <p className="border-foreground w-full border-b-2 py-2 text-xl font-bold">PRÓXIMOS PARTIDOS</p>
      {nextMatches.map((match, index) => (
        <div key={index}>
          {match.status === "scheduled" && (
            <div className="border-foreground flex w-full items-center justify-between gap-2.5 border-b-2 pb-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-2.5">
                  <p className="text-md font-bold">{match.local_team_name}</p>
                  <p className="text-md font-bold">{match.visitor_team_name}</p>
                  <p className="text-md font-bold">{match.date}</p>
                  <p className="text-md font-bold">{match.time}</p>
                </div>
              </div>
            </div>
          )}
          {match.status === "live" && (
            <div className="border-foreground flex w-full items-center justify-between gap-2.5 border-b-2 pb-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-red-500">EN VIVO</p>
                <div className="flex items-center gap-3 p-2.5">
                  <p className="text-md font-bold">{match.local_team_name}</p>
                  <p className="text-md font-bold">{match.visitor_team_name}</p>
                  <p className="text-md font-bold">{match.date}</p>
                  <p className="text-md font-bold">{match.time}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="bg-background flex flex-col gap-6 rounded-lg px-6 py-4 md:px-12">
      <p className="border-foreground w-full border-b-2 py-2 text-xl font-bold">PRÓXIMOS PARTIDOS</p>
      <div className="flex flex-col gap-6">
        <p className="text-md font-bold">No hay partidos próximos</p>
      </div>
    </div>
  );
}
