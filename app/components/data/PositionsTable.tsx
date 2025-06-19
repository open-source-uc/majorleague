// import { getPositions } from "@/app/actions/positions";
import Image from "next/image";
import placeholderLogo from "@/public/assets/oldBoysLogo.png";

interface TeamData {
  id: string;
  name: string;
  pts: number;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
}

interface TeamsCompetition {
  teams: TeamData[];
  competition: { id: string; name: string; semester: string; year: number; end_date: string; start_date: string };
}

const getPositions = async (year: string, semester: string): Promise<TeamsCompetition> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const teams: TeamData[] = [
    {
      id: "1",
      name: "Boca Juniors",
      pts: 25,
      pj: 10,
      g: 8,
      e: 1,
      p: 1,
      gf: 20,
      gc: 5,
      dg: 15,
    },
    {
      id: "2",
      name: "River Plate",
      pts: 22,
      pj: 10,
      g: 7,
      e: 1,
      p: 2,
      gf: 18,
      gc: 8,
      dg: 10,
    },
    {
      id: "3",
      name: "Racing Club",
      pts: 19,
      pj: 10,
      g: 6,
      e: 1,
      p: 3,
      gf: 15,
      gc: 10,
      dg: 5,
    },
    {
      id: "4",
      name: "Independiente",
      pts: 16,
      pj: 10,
      g: 5,
      e: 1,
      p: 4,
      gf: 12,
      gc: 11,
      dg: 1,
    },
    {
      id: "5",
      name: "San Lorenzo",
      pts: 13,
      pj: 10,
      g: 4,
      e: 1,
      p: 5,
      gf: 10,
      gc: 12,
      dg: -2,
    },
    {
      id: "6",
      name: "Estudiantes LP",
      pts: 10,
      pj: 10,
      g: 3,
      e: 1,
      p: 6,
      gf: 8,
      gc: 14,
      dg: -6,
    },
    {
      id: "7",
      name: "Vélez Sarsfield",
      pts: 7,
      pj: 10,
      g: 2,
      e: 1,
      p: 7,
      gf: 6,
      gc: 16,
      dg: -10,
    },
    {
      id: "8",
      name: "Rosario Central",
      pts: 4,
      pj: 10,
      g: 1,
      e: 1,
      p: 8,
      gf: 4,
      gc: 18,
      dg: -14,
    },
  ];

  // TODO: Obtener los datos de la base de datos
  // Ordenar equipos por puntos (de mayor a menor)
  const sortedTeams = [...teams].sort((a, b) => {
    // Primero por puntos
    if (b.pts !== a.pts) return b.pts - a.pts;
    // En caso de empate, por diferencia de goles
    if (b.dg !== a.dg) return b.dg - a.dg;
    // Si aún hay empate, por goles a favor
    return b.gf - a.gf;
  });

  return {
    teams: sortedTeams,
    competition: {
      id: "1",
      name: "Liga Profesional",
      semester: semester,
      year: parseInt(year),
      end_date: `${year}-12-15`,
      start_date: `${year}-02-15`,
    },
  };
};

export default async function PositionsTable({ year, semester }: { year: string; semester: string }) {
  const positions = await getPositions(year, semester);

  return (
    <div>
      <h1 className="mb-4 text-center font-bold">TABLA DE POSICIONES</h1>
      <div className="w-full max-w-4xl">
        <div className="bg-primary-darken mb-2 flex justify-center px-4 py-3">
          <span className="font-bold text-black">
            PERIODO {year} - {semester}
          </span>
        </div>
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
            {positions.teams.map((team: TeamData, index: number) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="flex items-center px-4 py-2">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                    <Image src={placeholderLogo} alt="Equipo" className="h-8 w-8 object-cover" priority />
                  </div>
                  {team.name}
                </td>
                <td className="bg-primary-darken px-4 py-2">{team.pts}</td>
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
    </div>
  );
}
