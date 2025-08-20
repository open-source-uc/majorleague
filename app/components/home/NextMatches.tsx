import { getNextMatches } from "@/actions/matches";
import { NextMatch } from "@/lib/types";

export default async function NextMatches() {
  const nextMatches: NextMatch[] = await getNextMatches();

  return (
    <div className="w-full space-y-6">
      {/* Header with athletic styling */}
      <div className="flex items-center gap-3">
        <div className="h-1 w-8 bg-gradient-to-r from-primary to-accent rounded-full"></div>
        <h3 className="text-lg font-black uppercase tracking-wide text-white">
          Próximos Partidos
        </h3>
        <div className="h-1 flex-1 bg-gradient-to-r from-accent to-transparent rounded-full"></div>
      </div>

      {/* Matches container */}
      <div className="space-y-4">
        {nextMatches.length > 0 ? (
          nextMatches.slice(0, 3).map((match, index) => (
            <div key={index} className="group relative">
              {/* Match card */}
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:scale-[1.02]">
                {/* Live indicator background glow */}
                {match.status === "live" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent animate-pulse"></div>
                )}
                
                <div className="relative p-4 space-y-3">
                  {/* Status badge */}
                  {match.status === "live" && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <div className="absolute inset-0 h-2 w-2 rounded-full bg-red-500 animate-ping"></div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                        En Vivo
                      </span>
                    </div>
                  )}
                  
                  {/* Teams section */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Local team */}
                      <div className="text-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-1">
                          <span className="text-xs font-bold text-black">L</span>
                        </div>
                        <p className="text-sm font-bold text-white max-w-[80px] truncate">
                          {match.local_team_name}
                        </p>
                      </div>
                      
                      {/* VS indicator */}
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">vs</span>
                        <div className="h-px w-8 bg-gradient-to-r from-transparent via-primary to-transparent mt-1"></div>
                      </div>
                      
                      {/* Visitor team */}
                      <div className="text-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-1">
                          <span className="text-xs font-bold text-black">V</span>
                        </div>
                        <p className="text-sm font-bold text-white max-w-[80px] truncate">
                          {match.visitor_team_name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Match details */}
                    <div className="text-right space-y-1">
                      <p className="text-xs font-medium text-gray-300">
                        {match.date}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {match.time}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Bottom accent line */}
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              </div>
            </div>
          ))
        ) : (
          /* Empty state */
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-black/60 to-gray-900/60 backdrop-blur-sm">
            <div className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mx-auto">
                <span className="text-lg">⚽</span>
              </div>
              <p className="text-sm font-medium text-gray-400">
                No hay partidos programados
              </p>
              <p className="text-xs text-gray-500">
                Mantente atento para los próximos enfrentamientos
              </p>
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          </div>
        )}
      </div>
      
      {/* View all matches link */}
      {nextMatches.length > 0 && (
        <div className="pt-2">
          <button className="group flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-primary">
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
      )}
    </div>
  );
}
