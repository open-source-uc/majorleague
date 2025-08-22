import Link from "next/link";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { hasParticipated } from "@/actions/participation";
import { getTeams } from "@/actions/teams";
import ParticipationForm from "@/components/forms/ParticipationForm";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Participa en Major League UC",
  description:
    "¡Únete a la acción! Registra tu participación en Major League UC, elige tu equipo y forma parte del mejor fútbol universitario de la UC.",
  keywords: "participar, registrarse, inscripción, equipos, jugadores, fútbol universitario, Major League UC",
  openGraph: {
    title: "Participa en Major League UC",
    description:
      "¡Únete a la acción! Registra tu participación en Major League UC y forma parte del mejor fútbol universitario.",
    url: "https://majorleague.uc.cl/participa",
    images: [
      {
        url: "/assets/logo-horizontal.svg",
        width: 1200,
        height: 630,
        alt: "Participa en Major League UC",
      },
    ],
  },
};

export default async function ParticipaPage() {
  const { isAuthenticated, userProfile } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    redirect("/login");
  }

  const participated = await hasParticipated(userProfile.id);
  if (participated) {
    redirect("/participa/gracias");
  }

  const teams = await getTeams();

  return (
    <div className="from-background via-card to-background relative min-h-screen overflow-hidden bg-gradient-to-br">
      {/* Subtle background pattern - consistent with login */}
      <div className="absolute inset-0 opacity-5">
        <div className="bg-primary absolute top-1/3 left-1/3 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-accent absolute right-1/3 bottom-1/3 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Clean Header - Matching Login Style */}
          <div className="mb-8 text-center">
            <div className="mb-6 text-6xl">🚀</div>
            <h1 className="text-foreground tablet:text-4xl mb-4 text-3xl font-bold">¡Únete a Major League UC!</h1>
            <p className="text-muted-foreground text-lg">Tu aventura futbolística está a solo un paso</p>
          </div>

          {/* Clean participation card */}
          <div className="border-border/50 bg-card/95 tablet:p-8 rounded-xl border p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-6 text-center">
              <h2 className="text-foreground mb-2 text-xl font-semibold">Solicitud de Participación</h2>
              <p className="text-muted-foreground text-sm">Te tomará menos de 3 minutos completar el registro</p>
            </div>

            <ParticipationForm teams={teams} />
          </div>

          {/* Quick Info - Simplified */}
          <div className="border-primary/30 bg-primary/5 mt-8 rounded-xl border p-6 shadow-sm backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-4 text-4xl">⚽</div>
              <h3 className="text-foreground mb-2 text-lg font-semibold">Temporada 2025</h3>
              <p className="text-muted-foreground text-sm">
                {teams.length} equipos • Asignación automática • Registro único
              </p>
            </div>
          </div>

          {/* Support Link - Matching Login Style */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              ¿Tienes preguntas?{" "}
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="text-primary hover:text-primary/80 font-medium underline transition-colors"
              >
                Contáctanos aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
