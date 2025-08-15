import Image from "next/image";

import type { TeamCompetition } from "@/lib/types";

const teamNameToLogoUrl = (teamName: string) => {
  const url = "/assets/teams/" + teamName.split(" ").join("") + "Logo.png";
  return url;
};

export default function PositionsTable({
  year,
  semester,
  teamCompetitions,
}: {
  year: string;
  semester: string;
  teamCompetitions: (TeamCompetition & { name: string })[];
}) {
  return (
    <div className="w-full px-4 py-8">
      {/* Simple Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Tabla de Posiciones
        </h1>
        <p className="text-sm text-accent-foreground">
          ¡Revisa cómo le va a tu equipo favorito en esta temporada!
        </p>
      </div>

      {/* Mobile-First Cards */}
      <div className="mx-auto max-w-md space-y-3 tablet:hidden">
        {teamCompetitions.map((team: TeamCompetition & { name: string }, index: number) => {
          const position = index + 1;
          const isLeader = position === 1;
          
          return (
            <div
              key={index}
              className={`rounded-lg border bg-card p-4 transition-colors ${
                isLeader ? 'border-primary/30 bg-primary/5' : 'border-border'
              }`}
            >
              {/* Team Header */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-primary text-primary-foreground">
                  {position}
                </div>
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-background border">
                  <Image
                    src={teamNameToLogoUrl(team.name)}
                    alt={`Logo ${team.name}`}
                    className="h-7 w-7 object-contain"
                    width={28}
                    height={28}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{team.name}</h3>
                  {isLeader && (
                    <p className="text-xs text-primary font-medium">Líder</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{team.points}</div>
                  <div className="text-xs text-muted-foreground">pts</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm">
                <div className="text-center">
                  <div className="font-medium text-foreground">{team.pj}</div>
                  <div className="text-xs text-muted-foreground">PJ</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">{team.g}</div>
                  <div className="text-xs text-muted-foreground">G</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-600">{team.e}</div>
                  <div className="text-xs text-muted-foreground">E</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">{team.p}</div>
                  <div className="text-xs text-muted-foreground">P</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${team.dg >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {team.dg >= 0 ? "+" : ""}{team.dg}
                  </div>
                  <div className="text-xs text-muted-foreground">DG</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (Responsive Enhancement) */}
      <div className="mt-12 hidden tablet:block">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-border bg-card">
          {/* Table Header */}
          <div className="border-b border-border bg-muted/30 px-6 py-3">
            <div className="grid grid-cols-9 gap-4 text-sm font-medium text-muted-foreground">
              <div className="text-center">Pos</div>
              <div className="col-span-3">Equipo</div>
              <div className="text-center">Pts</div>
              <div className="text-center">PJ</div>
              <div className="text-center">G</div>
              <div className="text-center">E</div>
              <div className="text-center">P</div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {teamCompetitions.map((team: TeamCompetition & { name: string }, index: number) => {
              const position = index + 1;
              const isLeader = position === 1;
              
              return (
                <div
                  key={index}
                  className={`grid grid-cols-9 gap-4 border-b border-border/50 px-6 py-4 transition-colors hover:bg-muted/20 ${
                    isLeader ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-primary text-primary-foreground">
                      {position}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-background border">
                      <Image
                        src={teamNameToLogoUrl(team.name)}
                        alt={`Logo ${team.name}`}
                        className="h-7 w-7 object-contain"
                        width={28}
                        height={28}
                      />
                    </div>
                    <span className="font-medium text-foreground">{team.name}</span>
                  </div>
                  <div className="flex items-center justify-center text-sm font-bold text-foreground">
                    {team.points}
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    {team.pj}
                  </div>
                  <div className="flex items-center justify-center text-sm text-green-600">
                    {team.g}
                  </div>
                  <div className="flex items-center justify-center text-sm text-yellow-600">
                    {team.e}
                  </div>
                  <div className="flex items-center justify-center text-sm text-red-600">
                    {team.p}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
