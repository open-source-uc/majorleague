import Link from "next/link";
import { redirect } from "next/navigation";

import { hasParticipated } from "@/actions/participation";
import { getTeams } from "@/actions/teams";
import ParticipationForm from "@/components/forms/ParticipationForm";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-card to-background">
      {/* Subtle background pattern - consistent with login */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-accent blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          
          {/* Clean Header - Matching Login Style */}
          <div className="mb-8 text-center">
            <div className="mb-6 text-6xl">🚀</div>
            <h1 className="mb-4 text-3xl font-bold text-foreground tablet:text-4xl">
              ¡Únete a Major League UC!
            </h1>
            <p className="text-lg text-muted-foreground">
              Tu aventura futbolística está a solo un paso
            </p>
          </div>

          {/* Clean participation card */}
          <div className="rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm tablet:p-8">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                Solicitud de Participación
              </h2>
              <p className="text-sm text-muted-foreground">
                Te tomará menos de 3 minutos completar el registro
              </p>
            </div>
            
            <ParticipationForm teams={teams} />
          </div>

          {/* Quick Info - Simplified */}
          <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-4 text-4xl">⚽</div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Temporada 2025</h3>
              <p className="text-sm text-muted-foreground">
                {teams.length} equipos • Asignación automática • Registro único
              </p>
            </div>
          </div>

          {/* Support Link - Matching Login Style */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Tienes preguntas?{" "}
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="text-primary hover:text-primary/80 font-medium transition-colors underline"
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
