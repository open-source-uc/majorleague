import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import placeholder from "@/../public/assets/image1.png";
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
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col items-start justify-center gap-10 lg:flex-row">
        <div className="w-full lg:flex-1">
          <ParticipationForm teams={teams} />
        </div>

        <div className="w-full lg:w-80">
          <div className="space-y-6">
            <div className="flex justify-center">
              <Image
                src={placeholder}
                alt="Major League UC"
                width={300}
                height={300}
                className="object-contain"
                priority
              />
            </div>

            <div className="bg-background-header border-border-header rounded-lg border p-6">
              <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
                <span className="text-primary text-2xl">🏆</span>
                ¿Por qué participar?
              </h3>
              <ul className="text-ml-grey space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">⚽</span>
                  <span>Representa a tu área de estudio en competencias oficiales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🤝</span>
                  <span>Conoce estudiantes de diferentes carreras</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🏅</span>
                  <span>Compite por el título de Major League UC</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">📊</span>
                  <span>Accede a estadísticas y seguimiento de tu progreso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🎉</span>
                  <span>Participa en eventos y actividades especiales</span>
                </li>
              </ul>
            </div>

            <div className="bg-background-header border-border-header rounded-lg border p-6">
              <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
                <span className="text-primary text-2xl">📋</span>
                Proceso de Selección
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-background flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">Envía tu solicitud</p>
                    <p className="text-ml-grey text-xs">Completa el formulario con tu información</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-background flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">Revisión del equipo</p>
                    <p className="text-ml-grey text-xs">Los capitanes evalúan tu solicitud</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-background flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">Confirmación</p>
                    <p className="text-ml-grey text-xs">Recibe la respuesta y comienza a jugar</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-header border-border-header rounded-lg border p-6">
              <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
                <span className="text-primary text-2xl">📞</span>
                ¿Necesitas ayuda?
              </h3>
              <p className="text-ml-grey mb-4 text-sm">
                Si tienes preguntas sobre el proceso o necesitas más información, no dudes en contactarnos.
              </p>
              <div className="space-y-2">
                <Link
                  href="https://www.instagram.com/opensource_euc/"
                  target="_blank"
                  className="text-primary hover:text-primary-darken flex items-center gap-2 text-sm transition-colors"
                >
                  <span>📧</span>
                  Contactanos
                </Link>
                <Link
                  href="/equipos"
                  className="text-primary hover:text-primary-darken flex items-center gap-2 text-sm transition-colors"
                >
                  <span>⚽</span>
                  Ver todos los equipos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Should be dynamic later managed by the dashboard */}
      <div className="mt-16 text-center">
        <div className="bg-primary/10 border-primary/30 rounded-lg border p-8">
          <h3 className="text-foreground mb-4 text-xl font-semibold">¡La temporada está por comenzar!</h3>
          <p className="text-ml-grey mx-auto max-w-2xl">
            Major League UC 2025 promete ser la temporada más emocionante hasta ahora. Con {teams.length} equipos
            compitiendo, nuevos talentos emergiendo y partidos llenos de adrenalina, no te pierdas la oportunidad de ser
            parte de esta increíble experiencia futbolística.
          </p>
        </div>
      </div>
    </div>
  );
}
