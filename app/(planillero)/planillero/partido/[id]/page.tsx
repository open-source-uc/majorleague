import Link from "next/link";
import { redirect } from "next/navigation";

import { getMatchPlanilleroData } from "@/actions/planilleros";
import { MatchValidator } from "@/components/admin/ConsolidatedMatchValidator";
import { AttendanceManager } from "@/components/planilleros/AttendanceManager";
import { CompletePlanilla } from "@/components/planilleros/CompletePlanilla";
import { EventTracker } from "@/components/planilleros/EventTracker";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Attendance, PlayerWithPosition } from "@/hooks/useAttendanceManager";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = parseInt(id);

  const { userProfile, isAdmin } = await getAuthStatus();

  if (!userProfile) {
    redirect("/login");
  }

  const matchData = await getMatchPlanilleroData(matchId, userProfile.id);

  if (!matchData || !matchData.planilleroInfo) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-primary mb-2 text-3xl font-semibold">Partido no encontrado</h2>
        <p className="text-foreground text-lg">El partido solicitado no existe o no tienes acceso a él.</p>
      </div>
    );
  }

  const {
    planilleroInfo,
    localTeamId,
    visitorTeamId,
    localTeamPlayers,
    visitorTeamPlayers,
    localTeamAttendance,
    visitorTeamAttendance,
    adminValidation,
    localEvents,
    visitorEvents,
    localPlayersWithAttendance,
    visitorPlayersWithAttendance,
    localTeamName,
    visitorTeamName,
  } = matchData;
  const matchStatus = planilleroInfo.match_status as string;

  if (matchStatus === "finished") {
    return (
      <div className="py-12 text-center">
        <h1 className="text-primary mb-2 text-3xl font-semibold">Partido Finalizado</h1>
        <p className="text-foreground text-lg">
          El partido ha finalizado, no puedes modificar los eventos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-8">
      <Link
        href="/planillero"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver a Mis Partidos
      </Link>
      {/* Header del Partido */}
      <div className="bg-background-header border-border-header rounded-lg border p-6 shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              {planilleroInfo.local_team_name as string} vs {planilleroInfo.visitor_team_name as string}
            </h1>
            <p className="text-foreground mt-1">
              {(() => {
                const raw = String(planilleroInfo.timestamp as string);
                const [datePart, timePartFull = ""] = raw.includes("T") ? raw.split("T") : raw.split(" ");
                const [y, m, d] = datePart.split("-").map((v) => parseInt(v, 10));
                const [hh = "00", mm = "00"] = timePartFull.split(":");
                const dt = new Date(y, (m || 1) - 1, d || 1, parseInt(hh, 10) || 0, parseInt(mm, 10) || 0);
                return dt.toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              })()}
            </p>
            {planilleroInfo.location ? (
              <p className="text-foreground mt-1">📍 {planilleroInfo.location as string}</p>
            ) : null}
          </div>
          <div className="text-right">
            <div className="text-primary text-3xl font-bold">
              {planilleroInfo.local_score as number} - {planilleroInfo.visitor_score as number}
            </div>
            <div className="text-foreground mt-1 text-sm">
              Estado:{" "}
              <span className="capitalize">
                {matchStatus === "admin_review"
                  ? "Revisión Admin"
                  : matchStatus === "live"
                    ? "En Vivo"
                    : matchStatus === "scheduled"
                      ? "Programado"
                      : matchStatus === "finished"
                        ? "Finalizado"
                        : matchStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Revisión Administrativa */}
      {matchStatus === "admin_review" && (
        <div className="bg-background-header border-border-header rounded-lg border p-6 shadow" aria-live="polite">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Estado del Partido</h3>
            <RefreshButton title="Actualizar estado" />
          </div>

          {adminValidation ? (
            <div
              className={`rounded-lg border p-4 ${
                adminValidation.status === "approved"
                  ? "border-green-200 bg-green-50"
                  : adminValidation.status === "rejected"
                    ? "border-red-200 bg-red-50"
                    : "border-purple-200 bg-purple-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {adminValidation.status === "approved" ? "✅" : adminValidation.status === "rejected" ? "❌" : "⚖️"}
                </span>
                <span className="font-medium">
                  {adminValidation.status === "approved"
                    ? "Partido Aprobado por Administración"
                    : adminValidation.status === "rejected"
                      ? "Partido Enviado a Corrección"
                      : "En Revisión Administrativa"}
                </span>
              </div>
              {adminValidation.comments && typeof adminValidation.comments === "string" ? (
                <p className="mt-2 text-sm italic">&quot;{adminValidation.comments}&quot;</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚖️</span>
                <span className="font-medium">En Revisión Administrativa</span>
              </div>
              <p className="mt-2 text-sm text-purple-700/80">
                Ambos planilleros han completado sus planillas. El administrador está revisando los datos para aprobar
                el partido.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Lado Izquierdo: Equipo Local */}
        <div className="min-w-0 space-y-4 lg:space-y-6">
          <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
            <h2 className="mb-4 text-lg font-semibold lg:text-xl">🏠 Equipo Local: {localTeamName as string}</h2>

            {/* Asistencia (solo programado o en vivo) */}
            {(matchStatus === "scheduled" || matchStatus === "live") && (
              <AttendanceManager
                matchId={matchId}
                attendance={localTeamAttendance as unknown as Attendance[]}
                players={localTeamPlayers as unknown as PlayerWithPosition[]}
              />
            )}
          </div>

          {/* Eventos durante partido en vivo */}
          {matchStatus === "live" && (
            <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
              <EventTracker
                matchId={matchId}
                players={localPlayersWithAttendance}
                initialEvents={localEvents}
                teamId={localTeamId}
              />
            </div>
          )}

          {/* Mostrar eventos cuando el partido está terminado o en admin review */}
          {(matchStatus === "finished" || matchStatus === "admin_review") && (
            <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
              <div className="py-6 text-center lg:py-8">
                <div className="mb-4">
                  <span className="text-6xl">{matchStatus === "finished" ? "🏁" : "⚖️"}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-green-800">
                  {matchStatus === "finished" ? "Partido Finalizado" : "En Revisión Administrativa"}
                </h3>
                <p className="text-green-600">
                  {matchStatus === "finished"
                    ? "El partido ha sido aprobado y finalizado por la administración."
                    : "El partido está siendo revisado por un administrador."}
                </p>
                {localEvents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="mb-3 font-medium">Eventos del Equipo Local:</h4>
                    <div className="space-y-2">
                      {localEvents.map((event: any) => (
                        <div key={event.id} className="bg-background border-border-header rounded border p-2 text-sm">
                          <span className="font-mono">{event.minute}&apos;</span> -{" "}
                          {event.type === "goal"
                            ? "⚽ Gol"
                            : event.type === "yellow_card"
                              ? "🟨 Tarjeta Amarilla"
                              : event.type === "red_card"
                                ? "🟥 Tarjeta Roja"
                                : event.type}
                          {event.player_name ? <span className="ml-2">({event.player_name})</span> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isAdmin && matchStatus === "admin_review" ? (
            <MatchValidator
              matchId={matchId}
              adminValidation={adminValidation}
              localTeamName={localTeamName}
              visitorTeamName={visitorTeamName}
            />
          ) : null}

          {/* Completar planilla o estado completado */}
          {planilleroInfo.status === "completed" && matchStatus === "live" ? (
            <div className="bg-background-header border-border-header rounded-lg border p-4">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <h3 className="text-foreground text-lg font-semibold">Planilla Completada</h3>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="font-medium text-green-800">Has completado tu planilla exitosamente</span>
                </div>
                <p className="mt-2 text-sm text-green-600">
                  Esperando a que el otro planillero complete su planilla para iniciar la validación.
                </p>
              </div>
            </div>
          ) : (
            <CompletePlanilla
              matchId={matchId}
              planilleroStatus={planilleroInfo.status as string}
              matchStatus={matchStatus}
            />
          )}
        </div>

        {/* Lado Derecho: Equipo Visitante */}
        <div className="min-w-0 space-y-4 lg:space-y-6">
          <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
            <h2 className="mb-4 text-lg font-semibold lg:text-xl">✈️ Equipo Visitante: {visitorTeamName as string}</h2>

            {/* Asistencia Visitante (solo programado o en vivo) */}
            {(matchStatus === "scheduled" || matchStatus === "live") && (
              <AttendanceManager
                matchId={matchId}
                attendance={visitorTeamAttendance as unknown as Attendance[]}
                players={visitorTeamPlayers as unknown as PlayerWithPosition[]}
              />
            )}
          </div>

          {/* Eventos visitante durante partido en vivo */}
          {matchStatus === "live" && (
            <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
              <EventTracker
                matchId={matchId}
                players={visitorPlayersWithAttendance}
                initialEvents={visitorEvents}
                teamId={visitorTeamId}
              />
            </div>
          )}

          {/* Mostrar eventos visitante cuando el partido está terminado o en admin review */}
          {(matchStatus === "finished" || matchStatus === "admin_review") && (
            <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
              <div className="py-6 text-center lg:py-8">
                <div className="mb-4">
                  <span className="text-6xl">{matchStatus === "finished" ? "🏁" : "⚖️"}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-green-800">
                  {matchStatus === "finished" ? "Partido Finalizado" : "En Revisión Administrativa"}
                </h3>
                <p className="text-green-600">
                  {matchStatus === "finished"
                    ? "El partido ha sido aprobado y finalizado por la administración."
                    : "El partido está siendo revisado por un administrador."}
                </p>
                {visitorEvents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="mb-3 font-medium">Eventos del Equipo Visitante:</h4>
                    <div className="space-y-2">
                      {visitorEvents.map((event: any) => (
                        <div key={event.id} className="bg-background border-border-header rounded border p-2 text-sm">
                          <span className="font-mono">{event.minute}&apos;</span> -{" "}
                          {event.type === "goal"
                            ? "⚽ Gol"
                            : event.type === "yellow_card"
                              ? "🟨 Tarjeta Amarilla"
                              : event.type === "red_card"
                                ? "🟥 Tarjeta Roja"
                                : event.type}
                          {event.player_name ? <span className="ml-2">({event.player_name})</span> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer de Estado */}
      <div className="bg-background-header border-border-header rounded-lg border p-6 shadow">
        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                (planilleroInfo.status as string) === "completed" ||
                (planilleroInfo.status as string) === "admin_review"
                  ? "bg-primary"
                  : (planilleroInfo.status as string) === "in_progress"
                    ? "bg-foreground/80"
                    : "bg-foreground/60"
              }`}
            />
            <span className="text-foreground text-sm">
              Mi estado:
              <span className="ml-1 font-medium">
                {(planilleroInfo.status as string) === "completed"
                  ? "Completado - Esperando revisión admin"
                  : (planilleroInfo.status as string) === "in_progress"
                    ? "En Progreso"
                    : (planilleroInfo.status as string) === "admin_review"
                      ? "En Revisión Administrativa"
                      : "Asignado"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                matchStatus === "finished"
                  ? "bg-green-500"
                  : matchStatus === "admin_review"
                    ? "bg-purple-500"
                    : matchStatus === "live"
                      ? "bg-red-500"
                      : "bg-foreground/60"
              }`}
            />
            <span className="text-foreground text-sm">
              Estado del partido:
              <span className="ml-1 font-medium">
                {matchStatus === "finished"
                  ? "Finalizado"
                  : matchStatus === "admin_review"
                    ? "Revisión Admin"
                    : matchStatus === "live"
                      ? "En Vivo"
                      : "Programado"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
