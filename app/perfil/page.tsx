import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlayerByProfileId, getJoinRequestsByProfileId } from "@/actions/auth";
import { getAuthStatus } from "@/lib/services/auth";
import { calculateAge } from "@/lib/utils/cn";

export const runtime = "edge";

export default async function Perfil() {
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  const { isAdmin, isAuthenticated, userProfile } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    return redirect("/login");
  }

  const playerInfo = await getPlayerByProfileId(userProfile.id);
  const pendingRequests = await getJoinRequestsByProfileId(userProfile.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPositionName = (position: string) => {
    const positions = {
      GK: "Portero",
      DEF: "Defensa",
      MID: "Mediocampo",
      FWD: "Delantero",
    };
    return positions[position as keyof typeof positions] || position;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-card to-background">
      {/* Subtle background pattern - consistent with login */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-accent blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Clean Header - Matching Login Style */}
          <div className="mb-8 text-center">
            <div className="mb-6 text-6xl">⚽</div>
            <h1 className="mb-4 text-3xl font-bold text-foreground tablet:text-4xl">
              Hola, {userProfile.username}
            </h1>
            <p className="mb-2 text-lg text-muted-foreground">
              Bienvenido a Major League UC
            </p>
          </div>

          {/* Profile Summary Card - Simplified */}
          <div className="mb-8 rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shadow-lg">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-card p-1">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {isAdmin && (
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white">
                    ⚡ Administrador
                  </span>
                )}
                {playerInfo && (
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                    ⚽ Jugador Activo
                  </span>
                )}
              </div>
            </div>

            {/* Player Status Summary */}
            {playerInfo ? (
              <div className="mb-6 space-y-3">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">
                    {playerInfo.first_name} {playerInfo.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPositionName(playerInfo.position)} • {calculateAge(playerInfo.birthday)} años
                  </p>
                </div>
                
                <div className="rounded-lg border border-border/30 bg-muted/20 p-3 text-center">
                  <span className="text-lg">🏆</span>
                  {playerInfo.team_name ? (
                    <p className="mt-1 font-medium text-foreground">{playerInfo.team_name}</p>
                  ) : (
                    <p className="mt-1 italic text-muted-foreground">Sin equipo asignado</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 text-center">
                <div className="mb-4 text-4xl">🚀</div>
                <p className="text-muted-foreground">
                  ¡Tu aventura futbolística está por comenzar!
                </p>
              </div>
            )}

            {/* Primary Action */}
            {!playerInfo && pendingRequests.length === 0 && (
              <Link
                href="/participa"
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-4 font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span className="text-xl">⚽</span>
                <span>Solicitar Participación</span>
              </Link>
            )}

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link
                href={`/posiciones/${year}/${semester}`}
                className="group flex w-full items-center gap-3 rounded-lg border border-border/30 bg-background/30 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="text-lg">📊</span>
                <span className="font-medium text-foreground group-hover:text-primary">Ver Posiciones</span>
              </Link>
              
              <Link
                href="/equipos"
                className="group flex w-full items-center gap-3 rounded-lg border border-border/30 bg-background/30 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="text-lg">👥</span>
                <span className="font-medium text-foreground group-hover:text-primary">Ver Equipos</span>
              </Link>
              
              <Link
                href="/"
                className="group flex w-full items-center gap-3 rounded-lg border border-border/30 bg-background/30 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium text-foreground group-hover:text-primary">Volver al Inicio</span>
              </Link>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mb-8 rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-foreground">Más Opciones</h3>
            
            <div className="space-y-3">
              <Link
                href="/participa/gracias"
                className="group flex w-full items-center gap-3 rounded-lg border border-border/30 bg-background/30 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="text-lg">📋</span>
                <span className="font-medium text-foreground group-hover:text-primary">Estado de Solicitud</span>
              </Link>
              
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="group flex w-full items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/10"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium text-foreground group-hover:text-purple-600">Panel de Administración</span>
                </Link>
              )}
            </div>
          </div>

          {/* Support Links - Matching Login Style */}
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Tu cuenta está vinculada con OSUC
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10"
              >
                <span>🔗</span>
                <span>Portal OSUC</span>
              </Link>
              
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-all duration-200 hover:bg-accent/10"
              >
                <span>📧</span>
                <span>Soporte</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
