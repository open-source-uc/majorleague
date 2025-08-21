import Link from "next/link";
import { redirect } from "next/navigation";

import { getMatchPlanilleroData } from "@/actions/planilleros";
import { AttendanceManager } from "@/components/planilleros/AttendanceManager";
import { CompletePlanilla } from "@/components/planilleros/CompletePlanilla";
import { EventTracker } from "@/components/planilleros/EventTracker";
import { ScorecardValidator } from "@/components/planilleros/ScorecardValidator";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Attendance, PlayerWithPosition } from "@/hooks/useAttendanceManager";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = parseInt(id);

  const { userProfile } = await getAuthStatus();

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
    myTeamId,
    rivalTeamId,
    myTeamPlayers,
    myTeamAttendance,
    validations,
    myTeamEvents,
    rivalEvents,
    playersWithAttendance,
    myTeamName,
    rivalTeamName,
  } = matchData;

  const myValidation = validations.find(
    (v: any) => v.validator_profile_id === userProfile.id && v.validated_team_id === rivalTeamId,
  );

  const myTeamValidation = validations.find((v: any) => v.validated_team_id === myTeamId);

  const myTeamValidationComments = myTeamValidation?.comments as string | undefined;

  if (matchData.planilleroInfo.match_status === "finished") {
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
                {(planilleroInfo.match_status as string) === "in_review"
                  ? "En Revisión"
                  : (planilleroInfo.match_status as string) === "live"
                    ? "En Vivo"
                    : (planilleroInfo.match_status as string) === "scheduled"
                      ? "Programado"
                      : (planilleroInfo.match_status as string) === "finished"
                        ? "Finalizado"
                        : (planilleroInfo.match_status as string)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Validación de Mi Planilla */}
      {myTeamValidation && (planilleroInfo.match_status as string) === "in_review" ? (
        <div className="bg-background-header border-border-header rounded-lg border p-6 shadow" aria-live="polite">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Estado de tu Planilla</h3>
            <RefreshButton title="Actualizar estado" />
          </div>

          {myTeamValidation.status === "rejected" && (
            <div className="border-border-header bg-background rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="bg-foreground/80 flex h-6 w-6 items-center justify-center rounded-full">
                  <span className="text-sm text-white">❌</span>
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Planilla Rechazada</p>
                  <p className="text-foreground/80 mt-1 text-sm">
                    El planillero rival ha solicitado correcciones en tu planilla.
                  </p>
                  {myTeamValidationComments ? (
                    <div className="bg-background border-border-header mt-3 rounded border p-3">
                      <p className="text-foreground text-sm font-medium">Comentarios del revisor:</p>
                      <p className="text-foreground/80 mt-1 text-sm">“{myTeamValidationComments}”</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {myTeamValidation.status === "approved" && (
            <div className="border-primary/40 bg-primary/5 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                  <span className="text-sm text-white">✅</span>
                </div>
                <div className="flex-1">
                  <p className="text-primary font-medium">Planilla Aprobada</p>
                  <p className="text-foreground mt-1 text-sm">El planillero rival ha aprobado tu planilla.</p>
                  {myTeamValidationComments ? (
                    <div className="bg-background border-border-header mt-3 rounded border p-3">
                      <p className="text-foreground text-sm font-medium">Comentarios del revisor:</p>
                      <p className="text-foreground/80 mt-1 text-sm">“{myTeamValidationComments}”</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {myTeamValidation.status === "pending" && (
            <div className="border-border-header bg-background-header rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="bg-foreground/60 flex h-6 w-6 items-center justify-center rounded-full">
                  <span className="text-sm text-white">⏳</span>
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Esperando Validación</p>
                  <p className="text-foreground/80 mt-1 text-sm">
                    Tu planilla está siendo revisada por el planillero rival.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Lado Izquierdo: Mi Equipo */}
        <div className="min-w-0 space-y-4 lg:space-y-6">
          <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
            <h2 className="mb-4 text-lg font-semibold lg:text-xl">Mi Equipo: {myTeamName as string}</h2>

            {/* Asistencia */}
            <AttendanceManager
              matchId={matchId}
              attendance={myTeamAttendance as unknown as Attendance[]}
              players={myTeamPlayers as unknown as PlayerWithPosition[]}
            />
          </div>

          {((planilleroInfo.match_status as string) === "live" ||
            (planilleroInfo.match_status as string) === "in_review" ||
            (planilleroInfo.match_status as string) === "scheduled") &&
            myTeamValidation?.status !== "approved" && (
              <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
                {/* Eventos */}
                <EventTracker matchId={matchId} players={playersWithAttendance} initialEvents={myTeamEvents} />
              </div>
            )}

          {/* Mostrar mensaje cuando la planilla está aprobada */}
          {((planilleroInfo.match_status as string) === "live" ||
            (planilleroInfo.match_status as string) === "in_review") &&
            myTeamValidation?.status === "approved" && (
              <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
                <div className="py-6 text-center lg:py-8">
                  <div className="mb-4">
                    <span className="text-6xl">✅</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-green-800">Planilla Aprobada</h3>
                  <p className="text-green-600">
                    Tu planilla ha sido aprobada. Ya no puedes modificar los eventos registrados.
                  </p>
                  {myTeamEvents.length > 0 && (
                    <div className="mt-6">
                      <h4 className="mb-3 font-medium">Eventos Finales Registrados:</h4>
                      <div className="space-y-2">
                        {myTeamEvents.map((event: any) => (
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

          {/* Completar planilla - Solo durante partido en vivo */}
          <CompletePlanilla
            matchId={matchId}
            planilleroStatus={planilleroInfo.status as string}
            matchStatus={planilleroInfo.match_status as string}
            myTeamValidation={myTeamValidation}
          />
        </div>

        {/* Lado Derecho: Equipo Rival */}
        <div className="min-w-0 space-y-4 lg:space-y-6">
          <div className="bg-background-header border-border-header rounded-lg border p-4 shadow lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold lg:text-xl">Equipo Rival: {rivalTeamName as string}</h2>
              {(planilleroInfo.match_status as string) === "in_review" && (
                <RefreshButton title="Actualizar validaciones" />
              )}
            </div>

            {(planilleroInfo.match_status as string) === "in_review" && (
              /* Validación de Planilla Rival */
              <ScorecardValidator
                matchId={matchId}
                rivalTeam={{
                  id: rivalTeamId as number,
                  name: rivalTeamName as string,
                  events: rivalEvents as any[],
                }}
                currentValidation={myValidation}
              />
            )}

            {(planilleroInfo.match_status as string) !== "in_review" && (
              <div className="text-foreground py-8 text-center">
                <p>La validación estará disponible cuando el partido esté en revisión</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer de Acciones */}
      <div className="bg-background-header border-border-header rounded-lg border p-6 shadow">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                (planilleroInfo.status as string) === "completed"
                  ? "bg-primary"
                  : (planilleroInfo.status as string) === "in_progress"
                    ? "bg-foreground/80"
                    : "bg-foreground/60"
              }`}
            />
            <span className="text-foreground text-sm">
              Mi planilla:
              <span className="ml-1 font-medium">
                {(planilleroInfo.status as string) === "completed"
                  ? "Completada"
                  : (planilleroInfo.status as string) === "in_progress"
                    ? "En Progreso"
                    : "Asignada"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                myValidation?.status === "approved"
                  ? "bg-primary"
                  : myValidation?.status === "rejected"
                    ? "bg-foreground/80"
                    : "bg-foreground/60"
              }`}
            />
            <span className="text-foreground text-sm">
              Validación rival:
              <span className="ml-1 font-medium">
                {myValidation?.status === "approved"
                  ? "Aprobada"
                  : myValidation?.status === "rejected"
                    ? "Rechazada"
                    : "Pendiente"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
