import type { TeamPlayer } from "@/actions/team-data";

interface PlayerCardProps {
  player: TeamPlayer;
  animationDelay?: string;
}

export default function PlayerCard({ player, animationDelay }: PlayerCardProps) {
  const getPositionLabel = (position: string) => {
    const positions = {
      GK: "Portero",
      DEF: "Defensa",
      MID: "Centro",
      FWD: "Delantero",
    };
    return positions[position as keyof typeof positions] || position;
  };

  return (
    <div
      className="bg-background-header border-border-header hover:border-primary/50 group animate-in fade-in-0 slide-in-from-bottom-4 flex h-full min-h-[180px] touch-manipulation flex-col rounded-lg border p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] md:min-h-[200px] md:p-4"
      style={{ animationDelay }}
    >
      <div className="mb-3 flex items-start justify-between gap-2 md:mb-4 md:gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2 md:gap-3">
          <div className="bg-primary flex h-10 w-10 min-w-[2.5rem] flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-black shadow-md transition-transform duration-300 group-hover:scale-110 md:h-12 md:w-12 md:min-w-[3rem] md:text-lg">
            {player.jersey_number || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground mb-1 line-clamp-2 min-h-[2rem] text-base leading-tight font-bold break-words md:min-h-[2.5rem] md:text-lg">
              {player.first_name} {player.last_name}
            </h3>
            {player.nickname ? (
              <p className="text-primary mb-1.5 line-clamp-1 min-h-[1rem] text-xs font-medium md:mb-2 md:min-h-[1.25rem] md:text-sm">
                &quot;{player.nickname}&quot;
              </p>
            ) : null}
            {!player.nickname && <div className="mb-1.5 min-h-[1rem] md:mb-2 md:min-h-[1.25rem]" />}
          </div>
        </div>
        <div className="min-w-0 flex-shrink-0 text-right">
          <p
            className="text-ml-grey bg-ml-grey/10 max-w-[100px] overflow-hidden rounded-full px-1.5 py-0.5 text-xs font-medium text-ellipsis whitespace-nowrap uppercase md:max-w-[80px] md:px-2 md:py-1"
            title={getPositionLabel(player.position)}
          >
            {getPositionLabel(player.position)}
          </p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2 md:gap-3">
        <div className="text-center">
          <p className="text-foreground text-lg font-bold md:text-xl">{player.stats.gamesPlayed || 0}</p>
          <p className="text-ml-grey text-xs leading-tight uppercase">Partidos</p>
        </div>
        <div className="text-center">
          <p className="text-foreground text-lg font-bold md:text-xl">{player.stats.goals || 0}</p>
          <p className="text-ml-grey text-xs leading-tight uppercase">Goles</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-400 md:text-xl">{player.stats.wins || 0}</p>
          <p className="text-ml-grey text-xs leading-tight uppercase">Ganados</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-400 md:text-xl">{player.stats.losses || 0}</p>
          <p className="text-ml-grey text-xs leading-tight uppercase">Perdidos</p>
        </div>
      </div>

      <div className="border-border-header mt-3 flex items-center justify-center gap-4 border-t pt-2 md:mt-4 md:gap-6 md:pt-3">
        <div className="group/card flex items-center gap-1.5 md:gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-sm transition-transform duration-200 group-hover/card:scale-110 md:h-3 md:w-3" />
          <span className="text-foreground text-xs font-medium md:text-sm">{player.stats.yellowCards || 0}</span>
        </div>
        <div className="group/card flex items-center gap-1.5 md:gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm transition-transform duration-200 group-hover/card:scale-110 md:h-3 md:w-3" />
          <span className="text-foreground text-xs font-medium md:text-sm">{player.stats.redCards || 0}</span>
        </div>
      </div>
    </div>
  );
}
