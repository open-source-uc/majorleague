import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlayerByProfileId, getJoinRequestsByProfileId, isCaptain } from "@/actions/auth";
import { isPlanillero } from "@/actions/planilleros";
import { getAuthStatus } from "@/lib/services/auth";
import { calculateAge } from "@/lib/utils/cn";

export const runtime = "edge";

export default async function Perfil() {
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  const { isAdmin, isAuthenticated, userProfile, isSuperAdmin } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    return redirect("/login");
  }

  const [playerInfo, pendingRequests, userIsPlanillero, userIsCaptain] = await Promise.all([
    getPlayerByProfileId(userProfile.id),
    getJoinRequestsByProfileId(userProfile.id),
    isPlanillero(userProfile.id),
    isCaptain(userProfile.id),
  ]);

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
    <div className="from-background via-card to-background relative min-h-screen overflow-hidden bg-gradient-to-br">
      {/* Subtle background pattern - consistent with login */}
      <div className="absolute inset-0 opacity-5">
        <div className="bg-primary absolute top-1/3 left-1/3 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-accent absolute right-1/3 bottom-1/3 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Clean Header - Matching Login Style */}
          <div className="mb-8 text-center">
            <div className="mb-6 text-6xl">⚽</div>
            <h1 className="text-foreground tablet:text-4xl mb-4 text-3xl font-bold">Hola, {userProfile.username}</h1>
            <p className="text-muted-foreground mb-2 text-lg">Bienvenido a Major League UC</p>
          </div>

          {/* Profile Summary Card - Simplified */}
          <div className="border-border/50 bg-card/95 mb-8 rounded-xl border p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="from-primary to-accent text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold shadow-lg">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-card absolute -right-1 -bottom-1 rounded-full p-1">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {isSuperAdmin ? (
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white">
                    ⚡ Super Administrador
                  </span>
                ) : isAdmin ? (
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white">
                    ⚡ Administrador
                  </span>
                ) : null}
                {playerInfo ? (
                  <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                    ⚽ Jugador Activo
                  </span>
                ) : null}
                {userIsCaptain ? (
                  <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                    👑 Capitán
                  </span>
                ) : null}
                {userIsPlanillero ? (
                  <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                    📋 Planillero
                  </span>
                ) : null}
              </div>
            </div>

            {/* Player Status Summary */}
            {playerInfo ? (
              <div className="mb-6 space-y-3">
                <div className="text-center">
                  <p className="text-foreground text-lg font-semibold">
                    {playerInfo.first_name} {playerInfo.last_name}{" "}
                    <span className="text-muted-foreground text-sm">
                      {playerInfo.nickname ? `• "${playerInfo.nickname}"` : ""}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {getPositionName(playerInfo.position)} • {calculateAge(playerInfo.birthday)} años{" "}
                    {playerInfo.jersey_number ? `• #${playerInfo.jersey_number}` : "•"}
                  </p>
                </div>

                <div className="border-border/30 bg-muted/20 rounded-lg border p-3 text-center">
                  <span className="text-lg">🏆</span>
                  {playerInfo.team_name ? (
                    <p className="text-foreground mt-1 font-medium">{playerInfo.team_name}</p>
                  ) : (
                    <p className="text-muted-foreground mt-1 italic">Sin equipo asignado</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 text-center">
                <div className="mb-4 text-4xl">🚀</div>
                <p className="text-muted-foreground">¡Tu aventura futbolística está por comenzar!</p>
              </div>
            )}

            {/* Primary Action */}
            {!playerInfo && pendingRequests.length === 0 && (
              <Link
                href="/participa"
                className="from-primary to-primary/90 text-primary-foreground mb-4 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r px-6 py-4 font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span className="text-xl">⚽</span>
                <span>Solicitar Participación</span>
              </Link>
            )}

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link
                href={`/posiciones/${year}/${semester}`}
                className="group border-border/30 bg-background/30 hover:border-primary/30 hover:bg-primary/5 flex w-full items-center gap-3 rounded-lg border p-3 transition-all duration-200"
              >
                <span className="text-lg">📊</span>
                <span className="text-foreground group-hover:text-primary font-medium">Ver Posiciones</span>
              </Link>

              <Link
                href="/equipos"
                className="group border-border/30 bg-background/30 hover:border-primary/30 hover:bg-primary/5 flex w-full items-center gap-3 rounded-lg border p-3 transition-all duration-200"
              >
                <span className="text-lg">👥</span>
                <span className="text-foreground group-hover:text-primary font-medium">Ver Equipos</span>
              </Link>

              <Link
                href="/"
                className="group border-border/30 bg-background/30 hover:border-primary/30 hover:bg-primary/5 flex w-full items-center gap-3 rounded-lg border p-3 transition-all duration-200"
              >
                <span className="text-lg">🏠</span>
                <span className="text-foreground group-hover:text-primary font-medium">Volver al Inicio</span>
              </Link>
            </div>
          </div>

          {/* Additional Options */}
          <div className="border-border/50 bg-card/95 mb-8 rounded-xl border p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-foreground mb-4 text-center text-lg font-semibold">Más Opciones</h3>

            <div className="space-y-3">
              <Link
                href="/participa/gracias"
                className="group border-border/30 bg-background/30 hover:border-primary/30 hover:bg-primary/5 flex w-full items-center gap-3 rounded-lg border p-3 transition-all duration-200"
              >
                <span className="text-lg">📋</span>
                <span className="text-foreground group-hover:text-primary font-medium">Estado de Solicitud</span>
              </Link>

              {isAdmin ? (
                <Link
                  href="/dashboard"
                  className="group flex w-full items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/10"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="text-foreground font-medium group-hover:text-purple-600">
                    Panel de Administración
                  </span>
                </Link>
              ) : null}
              {userIsCaptain ? (
                <Link
                  href="/capitan/dashboard"
                  className="group flex w-full items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/10"
                >
                  <span className="text-lg">👑</span>
                  <span className="text-foreground font-medium group-hover:text-purple-600">Panel de Capitan</span>
                </Link>
              ) : null}
              {userIsPlanillero ? (
                <Link
                  href="/planillero"
                  className="group flex w-full items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/10"
                >
                  <span className="text-lg">📋</span>
                  <span className="text-foreground font-medium group-hover:text-purple-600">Panel de Planilleros</span>
                </Link>
              ) : null}
            </div>
          </div>

          {/* Support Links - Matching Login Style */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4 text-sm">Tu cuenta está vinculada con OSUC</p>
            <div className="flex flex-col gap-2">
              <Link
                href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
                className="group border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                <span>🔗</span>
                <span>Portal OSUC</span>
              </Link>

              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="group border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200"
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
