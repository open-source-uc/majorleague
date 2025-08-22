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
      <div className="mb-12 text-center">
        <h2 className="text-foreground mb-4 text-3xl font-bold">Tabla de Posiciones</h2>
        <div className="from-primary to-primary/50 mx-auto h-1 w-56 rounded-full bg-gradient-to-r" />
      </div>

      {/* Mobile-First Cards */}
      <div className="tablet:hidden mx-auto max-w-md space-y-3">
        {teamCompetitions.map((team: TeamCompetition & { name: string }, index: number) => {
          const position = index + 1;
          const isLeader = position === 1;

          return (
            <div
              key={index}
              className={`bg-card rounded-lg border p-4 transition-colors ${
                isLeader ? "border-primary/30 bg-primary/5" : "border-border"
              }`}
            >
              {/* Team Header */}
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {position}
                </div>
                <div className="bg-background flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
                  <Image
                    src={teamNameToLogoUrl(team.name)}
                    alt={`Logo ${team.name}`}
                    className="h-7 w-7 object-contain"
                    width={28}
                    height={28}
                    loading="lazy"
                    sizes="28px"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold">{team.name}</h3>
                  {isLeader ? <p className="text-primary text-xs font-medium">Líder</p> : null}
                </div>
                <div className="text-right">
                  <div className="text-foreground text-lg font-bold">{team.points}</div>
                  <div className="text-muted-foreground text-xs">pts</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm">
                <div className="text-center">
                  <div className="text-foreground font-medium">{team.pj}</div>
                  <div className="text-muted-foreground text-xs">PJ</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">{team.g}</div>
                  <div className="text-muted-foreground text-xs">G</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-600">{team.e}</div>
                  <div className="text-muted-foreground text-xs">E</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">{team.p}</div>
                  <div className="text-muted-foreground text-xs">P</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${team.dg >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {team.dg >= 0 ? "+" : ""}
                    {team.dg}
                  </div>
                  <div className="text-muted-foreground text-xs">DG</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="tablet:block mt-12 hidden">
        <div className="border-border bg-card mx-auto max-w-6xl overflow-hidden rounded-lg border">
          {/* Table Header */}
          <div className="border-border bg-muted/30 border-b px-6 py-3">
            <div className="text-muted-foreground grid grid-cols-9 gap-4 text-sm font-medium">
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
                  className={`border-border/50 hover:bg-muted/20 grid grid-cols-9 gap-4 border-b px-6 py-4 transition-colors ${
                    isLeader ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                      {position}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="bg-background flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
                      <Image
                        src={teamNameToLogoUrl(team.name)}
                        alt={`Logo ${team.name}`}
                        className="h-7 w-7 object-contain"
                        width={28}
                        height={28}
                        loading="lazy"
                        sizes="28px"
                      />
                    </div>
                    <span className="text-foreground font-medium">{team.name}</span>
                  </div>
                  <div className="text-foreground flex items-center justify-center text-sm font-bold">
                    {team.points}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-center text-sm">{team.pj}</div>
                  <div className="flex items-center justify-center text-sm text-green-600">{team.g}</div>
                  <div className="flex items-center justify-center text-sm text-yellow-600">{team.e}</div>
                  <div className="flex items-center justify-center text-sm text-red-600">{team.p}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
