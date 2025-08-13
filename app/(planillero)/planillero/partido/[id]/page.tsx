import { getMatchPlanilleroData } from "@/actions/planilleros";
import { AttendanceManager } from "@/components/planilleros/AttendanceManager";
import { CompletePlanilla } from "@/components/planilleros/CompletePlanilla";
import { EventTracker } from "@/components/planilleros/EventTracker";
import { ScorecardValidator } from "@/components/planilleros/ScorecardValidator";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = parseInt(id);
  const { userProfile } = await getAuthStatus();

  if (!userProfile) {
    return <div>Error: Usuario no encontrado</div>;
  }

  const matchData = await getMatchPlanilleroData(matchId, userProfile.id);

  if (!matchData) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-3xl font-semibold text-primary">Partido no encontrado</h2>
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

  const myTeamValidation = validations.find(
    (v: any) => v.validated_team_id === myTeamId,
  );
  
  const myTeamValidationComments = myTeamValidation?.comments as string | undefined;



  return (
    <div className="space-y-8 min-w-0">
      {/* Header del Partido */}
      <div className="bg-background-header border-border-header rounded-lg border p-6 shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              {planilleroInfo.local_team_name as string} vs {planilleroInfo.visitor_team_name as string}
            </h1>
            <p className="text-foreground mt-1">
              {new Date(planilleroInfo.timestamp as string).toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {planilleroInfo.location && <p className="text-foreground mt-1">📍 {planilleroInfo.location as string}</p>}
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
      {myTeamValidation && (planilleroInfo.match_status as string) === "in_review" && (
        <div className="bg-background-header border-border-header rounded-lg border p-6 shadow" aria-live="polite">
          <h3 className="mb-4 text-lg font-semibold">Estado de tu Planilla</h3>
          
          {myTeamValidation.status === "rejected" && (
            <div className="rounded-lg border border-border-header bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-foreground/80 flex items-center justify-center">
                  <span className="text-white text-sm">❌</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Planilla Rechazada</p>
                  <p className="text-sm text-foreground/80 mt-1">
                    El planillero rival ha solicitado correcciones en tu planilla.
                  </p>
                  {myTeamValidationComments && (
                    <div className="mt-3 p-3 bg-background rounded border border-border-header">
                      <p className="text-sm font-medium text-foreground">Comentarios del revisor:</p>
                      <p className="text-sm text-foreground/80 mt-1">“{myTeamValidationComments}”</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {myTeamValidation.status === "approved" && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-sm">✅</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-primary">Planilla Aprobada</p>
                  <p className="text-sm text-foreground mt-1">
                    El planillero rival ha aprobado tu planilla.
                  </p>
                  {myTeamValidationComments && (
                    <div className="mt-3 p-3 bg-background rounded border border-border-header">
                      <p className="text-sm font-medium text-foreground">Comentarios del revisor:</p>
                      <p className="text-sm text-foreground/80 mt-1">“{myTeamValidationComments}”</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {myTeamValidation.status === "pending" && (
            <div className="rounded-lg border border-border-header bg-background-header p-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-foreground/60 flex items-center justify-center">
                  <span className="text-white text-sm">⏳</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Esperando Validación</p>
                  <p className="text-sm text-foreground/80 mt-1">
                    Tu planilla está siendo revisada por el planillero rival.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 min-w-0">
        {/* Lado Izquierdo: Mi Equipo */}
        <div className="space-y-4 lg:space-y-6 min-w-0">
          <div className="bg-background-header border-border-header rounded-lg border p-4 lg:p-6 shadow">
            <h2 className="mb-4 text-lg lg:text-xl font-semibold">Mi Equipo: {myTeamName as string}</h2>

            {/* Asistencia */}
            <AttendanceManager
              matchId={matchId}
              attendance={myTeamAttendance}
              players={myTeamPlayers}
            />
          </div>

          {((planilleroInfo.match_status as string) === "live" || (planilleroInfo.match_status as string) === "in_review" || (planilleroInfo.match_status as string) === "scheduled") && 
           myTeamValidation?.status !== "approved" && (
            <div className="bg-background-header border-border-header rounded-lg border p-4 lg:p-6 shadow">
              {/* Eventos */}
              <EventTracker
                matchId={matchId}
                players={playersWithAttendance}
                initialEvents={myTeamEvents}
              />
            </div>
          )}
          
          {/* Mostrar mensaje cuando la planilla está aprobada */}
          {((planilleroInfo.match_status as string) === "live" || (planilleroInfo.match_status as string) === "in_review") && 
           myTeamValidation?.status === "approved" && (
            <div className="bg-background-header border-border-header rounded-lg border p-4 lg:p-6 shadow">
              <div className="text-center py-6 lg:py-8">
                <div className="mb-4">
                  <span className="text-6xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Planilla Aprobada</h3>
                <p className="text-green-600">
                  Tu planilla ha sido aprobada. Ya no puedes modificar los eventos registrados.
                </p>
                {myTeamEvents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Eventos Finales Registrados:</h4>
                    <div className="space-y-2">
                      {myTeamEvents.map((event: any) => (
                        <div key={event.id} className="bg-background rounded p-2 text-sm border border-border-header">
                          <span className="font-mono">{event.minute}'</span> - {event.type === 'goal' ? '⚽ Gol' : event.type === 'yellow_card' ? '🟨 Tarjeta Amarilla' : event.type === 'red_card' ? '🟥 Tarjeta Roja' : event.type}
                          {event.player_name && <span className="ml-2">({event.player_name})</span>}
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
        <div className="space-y-4 lg:space-y-6 min-w-0">
          <div className="bg-background-header border-border-header rounded-lg border p-4 lg:p-6 shadow">
            <h2 className="mb-4 text-lg lg:text-xl font-semibold">Equipo Rival: {rivalTeamName as string}</h2>

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
      <div className="bg-background-header border-border-header rounded-lg border p-6 shadow ">
        <div className="flex items-center justify-between lg:flex-row flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${
              (planilleroInfo.status as string) === "completed"
                ? "bg-primary"
                : (planilleroInfo.status as string) === "in_progress"
                  ? "bg-foreground/80"
                  : "bg-foreground/60"
            }`} />
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
            <div className={`h-3 w-3 rounded-full ${
              myValidation?.status === "approved"
                ? "bg-primary"
                : myValidation?.status === "rejected"
                  ? "bg-foreground/80"
                  : "bg-foreground/60"
            }`} />
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
