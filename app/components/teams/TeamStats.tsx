interface TeamStatsProps {
  stats: {
    totalGames: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  };
}

export default function TeamStats({ stats }: TeamStatsProps) {
  const winPercentage = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
  const goalDifference = stats.goalsFor - stats.goalsAgainst;

  return (
    <div className="bg-background-header border-border-header animate-in fade-in-0 slide-in-from-top-4 rounded-lg border p-4 duration-500 md:p-6">
      <h3 className="text-foreground mb-4 text-center text-lg font-bold md:mb-6 md:text-xl">Estadísticas del Equipo</h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <div className="text-center">
          <p className="text-foreground text-xl font-bold md:text-2xl">{stats.totalGames}</p>
          <p className="text-ml-grey text-xs leading-tight uppercase md:text-sm">Partidos Jugados</p>
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-green-400 md:text-2xl">{stats.wins}</p>
          <p className="text-ml-grey text-xs leading-tight uppercase md:text-sm">Ganados</p>
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-yellow-400 md:text-2xl">{stats.draws}</p>
          <p className="text-ml-grey text-xs leading-tight uppercase md:text-sm">Empates</p>
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-red-400 md:text-2xl">{stats.losses}</p>
          <p className="text-ml-grey text-xs leading-tight uppercase md:text-sm">Derrotas</p>
        </div>

        <div className="text-center">
          <p className="text-primary text-xl font-bold md:text-2xl">{winPercentage}%</p>
          <p className="text-ml-grey text-xs leading-tight uppercase md:text-sm">Efectividad</p>
        </div>

        <div className="text-center">
          <p className={`text-xl font-bold md:text-2xl ${goalDifference >= 0 ? "text-green-400" : "text-red-400"}`}>
            {goalDifference > 0 ? "+" : ""}
            {goalDifference}
          </p>
          <p className="text-ml-grey text-xs leading-tight uppercase md:text-sm">Diferencia de Goles</p>
        </div>
      </div>

      <div className="border-border-header mt-4 border-t pt-3 md:mt-6 md:pt-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-foreground text-base font-bold md:text-lg">{stats.goalsFor}</p>
            <p className="text-ml-grey text-xs leading-tight uppercase">Goles a Favor</p>
          </div>
          <div className="text-ml-grey text-sm md:text-base">-</div>
          <div className="flex-1 text-center">
            <p className="text-foreground text-base font-bold md:text-lg">{stats.goalsAgainst}</p>
            <p className="text-ml-grey text-xs leading-tight uppercase">Goles en Contra</p>
          </div>
        </div>
      </div>
    </div>
  );
}
