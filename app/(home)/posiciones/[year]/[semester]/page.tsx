import type { Metadata } from "next";

import { getTeamCompetitionsByYearAndSemester } from "@/actions/positions";
import PositionsTable from "@/components/data/PositionsTable";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; semester: string }>;
}): Promise<Metadata> {
  const { year, semester } = await params;

  const semesterText = semester === "1" ? "Primer Semestre" : "Segundo Semestre";
  const title = `Tabla de Posiciones ${semesterText} ${year}`;
  const description = `Posiciones y estadísticas de los equipos de Major League UC durante el ${semesterText.toLowerCase()} de ${year}. Revisa puntos, partidos jugados y más.`;

  return {
    title,
    description,
    keywords: `posiciones, tabla, ${year}, ${semesterText}, Major League UC, fútbol universitario, estadísticas, puntos`,
    openGraph: {
      title: `${title} - Major League UC`,
      description,
      url: `https://majorleague.uc.cl/posiciones/${year}/${semester}`,
      siteName: "Major League UC",
      images: [
        {
          url: "/assets/logo-horizontal.svg",
          width: 1200,
          height: 630,
          alt: `${title} - Major League UC`,
        },
      ],
      locale: "es_CL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Major League UC`,
      description,
      images: ["/assets/og-image.jpg"],
    },
    alternates: {
      canonical: `https://majorleague.uc.cl/posiciones/${year}/${semester}`,
    },
  };
}

export default async function PosicionesPage({ params }: { params: Promise<{ year: string; semester: string }> }) {
  const { year, semester } = await params;
  const teamCompetitions = await getTeamCompetitionsByYearAndSemester(parseInt(year), parseInt(semester));

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-5 py-15 lg:flex-row">
        {teamCompetitions.length > 0 ? (
          <>
            <PositionsTable year={year} semester={semester} teamCompetitions={teamCompetitions} />
          </>
        ) : (
          <div>No hay una tabla de posiciones para este año y semestre</div>
        )}
      </div>
    </>
  );
}
