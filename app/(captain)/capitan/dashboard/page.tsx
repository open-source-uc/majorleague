import Link from "next/link";
import { redirect } from "next/navigation";

import { getCaptainJoinRequests, getCaptainTeamPlayers } from "@/actions/captain";
import { getCompleteTeamDataByCaptainId } from "@/actions/team-data";
import JoinRequestCard from "@/components/captain/JoinRequestCard";
import PlayerManagementCard from "@/components/captain/PlayerManagementCard";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function CaptainDashboard() {
  const { userProfile } = await getAuthStatus();

  if (!userProfile) {
    redirect("/login");
  }

  // Get team data for captain
  const teamData = await getCompleteTeamDataByCaptainId(userProfile.id);

  if (!teamData) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-4 text-2xl font-bold">No eres capitán de ningún equipo</h1>
          <p className="text-ml-grey mb-6">Para acceder al panel del capitán, necesitas ser capitán de un equipo.</p>
          <Link
            href="/"
            className="bg-primary hover:bg-primary-darken inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-black transition-all duration-300"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Get join requests and players for captain's team
  const [joinRequests, teamPlayers] = await Promise.all([
    getCaptainJoinRequests(userProfile.id),
    getCaptainTeamPlayers(userProfile.id),
  ]);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="from-background-header to-background border-border-header relative overflow-hidden border-b bg-gradient-to-br">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-3">
                  <span className="text-primary text-2xl">👨‍✈️</span>
                </div>
                <div>
                  <h1 className="text-foreground mb-2 text-2xl font-bold md:text-4xl">Panel del Capitán</h1>
                  <div className="text-ml-grey flex flex-col gap-2 text-sm sm:flex-row sm:items-center md:text-base">
                    <span>Gestionando:</span>
                    <span className="text-primary bg-primary/10 max-w-[200px] truncate rounded-full px-3 py-1 text-xs font-bold md:max-w-none md:text-sm">
                      {teamData.team.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-end">
              <Link
                href={`/equipos/${teamData.team.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}`}
                className="group border-border-header text-ml-grey hover:border-primary/50 hover:text-foreground flex min-h-[56px] items-center justify-center rounded-xl border-2 px-6 py-4 text-center font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <span className="mr-3 text-xl transition-transform duration-300 group-hover:scale-110">👁️</span>
                Ver Página Pública
              </Link>
              <Link
                href={`/equipos/${teamData.team.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/edit`}
                className="group from-primary to-primary-darken hover:from-primary-darken hover:to-primary flex min-h-[56px] items-center justify-center rounded-xl bg-gradient-to-r px-6 py-4 text-center font-bold text-black shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <span className="mr-3 text-xl transition-transform duration-300 group-hover:scale-110">✏️</span>
                Editar Equipo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-16">
          <div className="mb-10 text-center">
            <h2 className="text-foreground mb-3 text-2xl font-bold md:text-3xl">Resumen del Equipo</h2>
            <p className="text-ml-grey mx-auto max-w-2xl text-base md:text-lg">
              Un vistazo rápido al estado actual de tu equipo y las tareas pendientes
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            <div className="group from-background-header to-background border-border-header hover:border-primary/40 rounded-xl border-2 bg-gradient-to-br p-4 text-center transition-all duration-500 hover:scale-[1.02] hover:shadow-xl md:p-6">
              <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16">
                <span className="text-primary text-xl md:text-2xl">👥</span>
              </div>
              <p className="text-foreground mb-2 text-2xl font-bold md:text-3xl">{teamPlayers.length}</p>
              <p className="text-ml-grey mb-2 text-xs font-semibold tracking-wider uppercase md:text-sm">
                Jugadores Activos
              </p>
              <div className="bg-border-header h-1 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${Math.min((teamPlayers.length / 25) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="group from-background-header to-background border-border-header rounded-xl border-2 bg-gradient-to-br p-4 text-center transition-all duration-500 hover:scale-[1.02] hover:border-yellow-400/40 hover:shadow-xl md:p-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10 transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16">
                <span className="text-xl text-yellow-400 md:text-2xl">📥</span>
              </div>
              <p className="mb-2 text-2xl font-bold text-yellow-400 md:text-3xl">{joinRequests.length}</p>
              <p className="text-ml-grey mb-2 text-xs font-semibold tracking-wider uppercase md:text-sm">
                Solicitudes Pendientes
              </p>
              {joinRequests.length > 0 && (
                <div className="rounded-full bg-yellow-400/20 px-2 py-1 text-xs font-medium text-yellow-300">
                  ⚡ Requiere atención
                </div>
              )}
            </div>

            <div className="group from-background-header to-background border-border-header rounded-xl border-2 bg-gradient-to-br p-4 text-center transition-all duration-500 hover:scale-[1.02] hover:border-green-400/40 hover:shadow-xl md:p-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-400/10 transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16">
                <span className="text-xl text-green-400 md:text-2xl">🏆</span>
              </div>
              <p className="mb-2 text-2xl font-bold text-green-400 md:text-3xl">{teamData.stats.wins}</p>
              <p className="text-ml-grey mb-2 text-xs font-semibold tracking-wider uppercase md:text-sm">Victorias</p>
              <div className="text-xs leading-tight text-green-300">
                {teamData.stats.wins + teamData.stats.draws + teamData.stats.losses > 0
                  ? `${Math.round((teamData.stats.wins / (teamData.stats.wins + teamData.stats.draws + teamData.stats.losses)) * 100)}% efectividad`
                  : "Sin partidos jugados"}
              </div>
            </div>

            <div className="group from-background-header to-background border-border-header hover:border-primary/40 rounded-xl border-2 bg-gradient-to-br p-4 text-center transition-all duration-500 hover:scale-[1.02] hover:shadow-xl md:p-6">
              <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16">
                <span className="text-primary text-xl md:text-2xl">⭐</span>
              </div>
              <p className="text-primary mb-2 text-2xl font-bold md:text-3xl">{teamData.stats.points}</p>
              <p className="text-ml-grey mb-2 text-xs font-semibold tracking-wider uppercase md:text-sm">
                Puntos Totales
              </p>
              <div className="text-primary-darken text-xs">Posición en liga</div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-foreground mb-3 text-xl font-bold md:text-2xl lg:text-3xl">
                📥 Solicitudes de Unión
              </h2>
              <p className="text-ml-grey text-sm md:text-base lg:text-lg">
                Revisa y gestiona las solicitudes para unirse a tu equipo
                {joinRequests.length > 0 && (
                  <span className="mt-2 ml-2 inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-400 md:mt-0 md:ml-3 md:gap-2 md:px-4 md:py-2 md:text-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400 md:h-2 md:w-2" />
                    {joinRequests.length} pendiente{joinRequests.length > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>

            {joinRequests.length > 0 && (
              <div className="rounded-xl border-2 border-yellow-500/30 bg-yellow-500/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-500/20 p-2">
                    <span className="text-lg text-yellow-400">⚡</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-yellow-400">Acción Requerida</p>
                    <p className="text-xs text-yellow-300">Hay solicitudes esperando tu revisión</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {joinRequests.length === 0 ? (
            <div className="from-background-header to-background border-border-header relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-12 text-center">
              {/* Background decoration */}
              <div className="border-primary/10 absolute top-4 right-4 h-20 w-20 rounded-full border" />
              <div className="bg-primary/5 absolute bottom-4 left-4 h-16 w-16 rounded-full" />

              <div className="relative z-10">
                <div className="bg-primary/10 mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full">
                  <span className="text-primary text-4xl">📥</span>
                </div>
                <h3 className="text-foreground mb-4 text-2xl font-bold">Todo bajo control</h3>
                <p className="text-ml-grey mx-auto mb-6 max-w-md text-lg leading-relaxed">
                  No hay solicitudes pendientes en este momento. Cuando alguien quiera unirse a tu equipo, aparecerá
                  aquí.
                </p>
                <div className="bg-primary/5 border-primary/20 inline-block rounded-xl border px-6 py-4">
                  <p className="text-primary flex items-center gap-2 text-sm font-semibold">
                    <span>📝</span>
                    Los jugadores pueden solicitar unirse desde la página pública
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {joinRequests.map((request) => (
                <JoinRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>

        <div className="mb-16">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-foreground mb-3 text-xl font-bold md:text-2xl lg:text-3xl">
                👥 Plantilla del Equipo
              </h2>
              <p className="text-ml-grey text-sm md:text-base lg:text-lg">
                Gestiona la información de tus jugadores y sus apodos
                {teamPlayers.length > 0 && (
                  <span className="bg-primary/20 text-primary mt-2 ml-2 inline-block rounded-full px-3 py-1 text-xs font-bold md:mt-0 md:ml-3 md:px-4 md:py-2 md:text-sm">
                    {teamPlayers.length} jugador{teamPlayers.length > 1 ? "es" : ""}
                  </span>
                )}
              </p>
            </div>

            <div className="bg-primary/5 border-primary/20 rounded-xl border-2 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-2">
                  <span className="text-primary text-lg">📝</span>
                </div>
                <div>
                  <p className="text-primary text-sm font-bold">Gestión Completa</p>
                  <p className="text-primary-darken text-xs">Edita apodos y remueve jugadores</p>
                </div>
              </div>
            </div>
          </div>

          {teamPlayers.length === 0 ? (
            <div className="from-background-header to-background border-border-header relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-12 text-center">
              {/* Background decoration */}
              <div className="border-primary/10 absolute top-6 right-6 h-16 w-16 rounded-full border" />
              <div className="bg-primary/5 absolute bottom-6 left-6 h-12 w-12 rounded-full" />

              <div className="relative z-10">
                <div className="bg-primary/10 mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full">
                  <span className="text-primary text-4xl">👥</span>
                </div>
                <h3 className="text-foreground mb-4 text-2xl font-bold">Equipo en formación</h3>
                <p className="text-ml-grey mx-auto mb-6 max-w-md text-lg leading-relaxed">
                  Aún no tienes jugadores en tu equipo. Aprueba solicitudes de unión para comenzar a formar tu
                  plantilla.
                </p>
                <div className="inline-block rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                    <span>⚡</span>
                    Revisa las solicitudes pendientes arriba
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-2">
              {teamPlayers.map((player) => (
                <PlayerManagementCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </div>

        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-2xl font-bold md:text-3xl">⚡ Acciones Rápidas</h2>
            <p className="text-ml-grey mx-auto max-w-2xl text-base md:text-lg">
              Herramientas esenciales para gestionar tu equipo de manera eficiente
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <Link
              href={`/equipos/${teamData.team.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")}/edit`}
              className="group from-background-header to-background border-border-header hover:border-primary/50 relative overflow-hidden rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl md:p-8"
            >
              {/* Background decoration */}
              <div className="bg-primary/5 absolute top-0 right-0 h-20 w-20 translate-x-10 -translate-y-10 rounded-full transition-transform duration-500 group-hover:scale-150" />

              <div className="relative z-10">
                <div className="from-primary/20 to-primary/10 text-primary mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-foreground group-hover:text-primary mb-3 text-xl font-bold transition-colors duration-300 md:mb-4 md:text-2xl">
                  Editar Información
                </h3>
                <p className="text-ml-grey mb-4 text-base leading-relaxed md:text-lg">
                  Actualiza descripción, contacto, fotos y todos los detalles de tu equipo
                </p>
                <div className="text-primary flex items-center text-sm font-semibold transition-transform duration-300 group-hover:translate-x-2">
                  <span>Ir al editor</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              href={`/equipos/${teamData.team.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")}`}
              className="group from-background-header to-background border-border-header relative overflow-hidden rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-500 hover:scale-[1.02] hover:border-green-400/50 hover:shadow-2xl md:p-8"
            >
              {/* Background decoration */}
              <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-green-400/5 transition-transform duration-500 group-hover:scale-150" />

              <div className="relative z-10">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400/20 to-green-400/10 text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-foreground mb-3 text-xl font-bold transition-colors duration-300 group-hover:text-green-400 md:mb-4 md:text-2xl">
                  Página Pública
                </h3>
                <p className="text-ml-grey mb-4 text-base leading-relaxed md:text-lg">
                  Ve cómo los demás usuarios ven tu equipo y su información
                </p>
                <div className="flex items-center text-sm font-semibold text-green-400 transition-transform duration-300 group-hover:translate-x-2">
                  <span>Ver página</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {teamData.upcomingMatches.length > 0 && (
          <div className="mb-16">
            <div className="mb-12 text-center">
              <h2 className="text-foreground mb-4 text-2xl font-bold md:text-3xl">⚽ Próximos Partidos</h2>
              <p className="text-ml-grey mx-auto max-w-2xl text-base md:text-lg">
                Mantente al día con los próximos compromisos de tu equipo
              </p>
            </div>

            <div className="from-background-header to-background border-border-header relative overflow-hidden rounded-xl border-2 bg-gradient-to-br p-4 md:p-6 lg:p-8">
              {/* Background decoration */}
              <div className="from-primary/5 absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br to-transparent" />

              <div className="relative z-10 space-y-8">
                {teamData.upcomingMatches.slice(0, 3).map((match, index) => (
                  <div
                    key={match.id}
                    className="group bg-background/50 border-border-header hover:border-primary/30 rounded-lg border-2 p-4 transition-all duration-300 hover:shadow-lg md:p-6"
                  >
                    <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
                          <div className="bg-primary/10 flex-shrink-0 rounded-full p-2 md:p-3">
                            <span className="text-primary text-lg md:text-xl">⚽</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground mb-1 truncate text-lg font-bold md:text-xl">
                              vs {match.opponent}
                            </p>
                            <div className="text-ml-grey flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4 md:text-base">
                              <span className="flex items-center gap-1 md:gap-2">
                                <span className="text-primary">📅</span>
                                <span className="truncate">{match.date}</span>
                              </span>
                              <span className="flex items-center gap-1 md:gap-2">
                                <span className="text-primary">🕰️</span>
                                <span>{match.time}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center md:gap-4 lg:flex-shrink-0">
                        <div className="text-center sm:text-left">
                          <span
                            className={`inline-block rounded-lg px-3 py-2 text-xs font-bold md:px-4 md:py-2.5 md:text-sm ${
                              match.type === "home"
                                ? "border border-green-500/30 bg-green-500/20 text-green-400"
                                : "border border-blue-500/30 bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {match.type === "home" ? "🏠 LOCAL" : "✈️ VISITANTE"}
                          </span>
                        </div>

                        <div className="min-w-0 text-left sm:text-center lg:text-right">
                          <p className="text-ml-grey flex items-center gap-1 text-sm md:gap-2 md:text-base">
                            <span className="text-primary flex-shrink-0">🏠</span>
                            <span className="truncate">{match.venue}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {teamData.upcomingMatches.length > 3 && (
                <div className="mt-8 text-center">
                  <p className="text-ml-grey text-sm">
                    Y {teamData.upcomingMatches.length - 3} partido{teamData.upcomingMatches.length - 3 > 1 ? "s" : ""}{" "}
                    más...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
