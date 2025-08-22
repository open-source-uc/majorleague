import Image from "next/image";

import { getNextMatches } from "@/actions/matches";
import { NextMatch } from "@/lib/types";

const teamNameToLogoUrl = (teamName: string) => {
  const url = "/assets/teams/" + teamName.split(" ").join("") + "Logo.png";
  return url;
};

export default async function NextMatches() {
  const nextMatches: NextMatch[] = await getNextMatches();

  return (
    <div className="w-full space-y-6">
      {/* Header with athletic styling */}
      <div className="flex items-center gap-3">
        <div className="from-primary to-accent h-1 w-8 rounded-full bg-gradient-to-r" />
        <h3 className="text-lg font-black tracking-wide text-white uppercase">Próximos Partidos</h3>
        <div className="from-accent h-1 flex-1 rounded-full bg-gradient-to-r to-transparent" />
      </div>

      {/* Matches container */}
      <div className="space-y-4">
        {nextMatches.length > 0 ? (
          nextMatches.slice(0, 3).map((match, index) => (
            <div key={index} className="group relative">
              {/* Match card */}
              <div className="hover:border-primary/30 relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
                {/* Live indicator background glow */}
                {match.status === "live" && (
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-red-500/20 to-transparent" />
                )}

                <div className="relative space-y-3 p-4">
                  {/* Status badge */}
                  {match.status === "live" && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-red-500" />
                      </div>
                      <span className="text-xs font-bold tracking-wider text-red-500 uppercase">En Vivo</span>
                    </div>
                  )}

                  {/* Teams section */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-6">
                      {/* Local team */}
                      <div className="flex w-24 flex-col items-center text-center sm:w-28">
                        <div className="from-primary to-primary/70 mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br p-0.5">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                            <Image
                              src={teamNameToLogoUrl(match.local_team_name)}
                              alt={`Logo ${match.local_team_name}`}
                              className="h-6 w-6 object-contain"
                              width={24}
                              height={24}
                              loading="lazy"
                              sizes="24px"
                            />
                          </div>
                        </div>
                        <p className="line-clamp-2 flex min-h-[2.5rem] items-center text-xs leading-tight font-bold text-white sm:text-sm">
                          {match.local_team_name}
                        </p>
                      </div>

                      {/* VS indicator */}
                      <div className="flex flex-shrink-0 flex-col items-center px-2">
                        <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">vs</span>
                        <div className="via-primary mt-1 h-px w-6 bg-gradient-to-r from-transparent to-transparent sm:w-8" />
                      </div>

                      {/* Visitor team */}
                      <div className="flex w-24 flex-col items-center text-center sm:w-28">
                        <div className="from-accent to-accent/70 mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br p-0.5">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                            <Image
                              src={teamNameToLogoUrl(match.visitor_team_name)}
                              alt={`Logo ${match.visitor_team_name}`}
                              className="h-6 w-6 object-contain"
                              width={24}
                              height={24}
                              loading="lazy"
                              sizes="24px"
                            />
                          </div>
                        </div>
                        <p className="line-clamp-2 flex min-h-[2.5rem] items-center text-xs leading-tight font-bold text-white sm:text-sm">
                          {match.visitor_team_name}
                        </p>
                      </div>
                    </div>

                    {/* Match details */}
                    <div className="flex-shrink-0 space-y-1 text-right">
                      <p className="text-xs font-medium text-gray-300">{match.date}</p>
                      <p className="text-primary text-sm font-bold">{match.time}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="from-primary via-accent to-primary h-1 bg-gradient-to-r" />
              </div>
            </div>
          ))
        ) : (
          /* Empty state */
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-black/60 to-gray-900/60 backdrop-blur-sm">
            <div className="space-y-3 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-800">
                <span className="text-lg">⚽</span>
              </div>
              <p className="text-sm font-medium text-gray-400">No hay partidos programados</p>
              <p className="text-xs text-gray-500">Mantente atento para los próximos enfrentamientos</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          </div>
        )}
      </div>

      {/* View all matches link */}
      {/* {nextMatches.length > 0 && (
        <div className="pt-2">
          <button className="group hover:text-primary flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors">
            <span>Ver todos los partidos</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      )} */}
    </div>
  );
}
