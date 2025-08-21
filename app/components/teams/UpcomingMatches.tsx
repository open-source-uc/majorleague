import type { TeamMatch } from "@/actions/team-data";

interface UpcomingMatchesProps {
  matches: TeamMatch[];
}

export default function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split("-").map((v) => parseInt(v, 10));
    const date = new Date(y, (m || 1) - 1, d || 1);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="bg-background-header border-border-header animate-in fade-in-0 slide-in-from-bottom-4 rounded-lg border p-4 duration-700">
      <h3 className="text-foreground mb-4 text-xl font-bold">Próximos Partidos</h3>

      {matches.length === 0 ? (
        <p className="text-ml-grey py-8 text-center">No hay partidos programados</p>
      ) : (
        <div className="space-y-3">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className="border-border-header hover:border-primary/30 animate-in fade-in-0 slide-in-from-left-4 rounded-lg border p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        match.type === "home" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {match.type === "home" ? "LOCAL" : "VISITANTE"}
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="text-foreground text-lg font-semibold">vs {match.opponent}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <svg
                        className="text-ml-grey h-4 w-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-ml-grey whitespace-nowrap">{formatDate(match.date)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <svg
                        className="text-ml-grey h-4 w-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-ml-grey whitespace-nowrap">{match.time}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-start gap-1">
                    <svg
                      className="text-ml-grey mt-0.5 h-4 w-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-ml-grey text-sm break-words">{match.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
