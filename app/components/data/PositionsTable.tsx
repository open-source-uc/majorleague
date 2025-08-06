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
    <div className="w-full">
      <h1 className="mb-4 text-center text-3xl font-bold">TABLA DE POSICIONES</h1>
      <div className="mx-auto w-full max-w-4xl">
        <div className="bg-primary-darken mb-2 flex justify-center px-4 py-3">
          <span className="font-bold text-black">
            PERIODO {year} - {semester}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-ml-grey text-center">
                <th className="px-4 py-2">POS</th>
                <th className="px-4 py-2">EQUIPO</th>
                <th className="bg-parimary-drken px-4 py-2">PTS</th>
                <th className="px-4 py-2">PJ</th>
                <th className="px-4 py-2">G</th>
                <th className="px-4 py-2">E</th>
                <th className="px-4 py-2">P</th>
                <th className="px-4 py-2">GF</th>
                <th className="px-4 py-2">GC</th>
                <th className="px-4 py-2">DG</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {teamCompetitions.map((team: TeamCompetition & { name: string }, index: number) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="flex items-center px-4 py-2">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                      <Image
                        src={teamNameToLogoUrl(team.name)}
                        alt="Equipo"
                        className="h-8 w-8 object-cover"
                        priority
                        width={32}
                        height={32}
                      />
                    </div>
                    {team.name}
                  </td>
                  <td className="bg-primary-darken px-4 py-2">{team.points}</td>
                  <td className="px-4 py-2">{team.pj}</td>
                  <td className="px-4 py-2">{team.g}</td>
                  <td className="px-4 py-2">{team.e}</td>
                  <td className="px-4 py-2">{team.p}</td>
                  <td className="px-4 py-2">{team.gf}</td>
                  <td className="px-4 py-2">{team.gc}</td>
                  <td className="px-4 py-2">{team.dg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mx-auto block max-w-md space-y-4 pt-10 lg:hidden">
          {teamCompetitions.map((team: TeamCompetition & { name: string }, index: number) => (
            <div
              key={index}
              className="bg-background border-border-header hover:border-primary/50 rounded-lg border p-6 transition-all"
            >
              {/* Header with position and team */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                    <Image
                      src={teamNameToLogoUrl(team.name)}
                      alt="Equipo"
                      className="h-8 w-8 object-cover"
                      priority
                      width={32}
                      height={32}
                    />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{team.name}</div>
                    <div className="text-sm text-gray-400">Posición #{index + 1}</div>
                  </div>
                </div>
                <div className="bg-primary-darken rounded px-3 py-1 font-bold text-black">{team.points} PTS</div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">PJ</div>
                  <div className="font-semibold">{team.pj}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">G</div>
                  <div className="font-semibold text-green-400">{team.g}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">E</div>
                  <div className="font-semibold text-yellow-400">{team.e}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">P</div>
                  <div className="font-semibold text-red-400">{team.p}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">GF</div>
                  <div className="font-semibold">{team.gf}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">GC</div>
                  <div className="font-semibold">{team.gc}</div>
                </div>
              </div>

              {/* Goal difference */}
              <div className="mt-3 flex justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-400">DG</div>
                  <div className={`font-bold ${team.dg >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {team.dg >= 0 ? "+" : ""}
                    {team.dg}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
