"use client";

import { useActionState, useOptimistic, startTransition, useState } from "react";

import { assignPlanillero, removePlanillero, changePlanillero } from "@/actions/planilleros";

interface PlanilleroManagerProps {
  matches: any[];
  allMatches: any[];
  profiles: any[];
}

export function PlanilleroManager({ matches, allMatches, profiles }: PlanilleroManagerProps) {
  const [state, formAction] = useActionState(assignPlanillero, {
    success: 0,
    errors: 0,
    message: "",
  });

  const [removeState, removeAction] = useActionState(removePlanillero, {
    success: 0,
    errors: 0,
    message: "",
  });

  const [changeState, changeAction] = useActionState(changePlanillero, {
    success: 0,
    errors: 0,
    message: "",
  });

  const [activeTab, setActiveTab] = useState<"pending" | "assigned">("pending");

  // Optimistic updates para reflejar cambios inmediatamente
  const [optimisticMatches, updateOptimisticMatches] = useOptimistic(
    matches,
    (
      state,
      {
        matchId,
        teamType,
        profileId,
        username,
      }: {
        matchId: number;
        teamType: "local" | "visitor";
        profileId: string;
        username: string;
      },
    ) => {
      return state.map((match) => {
        if (match.id === matchId) {
          const updatedMatch = { ...match };
          if (teamType === "local") {
            updatedMatch.local_planillero = { profile_id: profileId, username };
          } else {
            updatedMatch.visitor_planillero = { profile_id: profileId, username };
          }
          // Actualizar contador
          const currentCount = match.planilleros_count || 0;
          updatedMatch.planilleros_count = currentCount + 1;
          return updatedMatch;
        }
        return match;
      });
    },
  );

  const handleAssignPlanillero = (formData: FormData) => {
    const matchId = parseInt(formData.get("match_id") as string);
    const teamId = parseInt(formData.get("team_id") as string);
    const profileId = formData.get("profile_id") as string;

    const selectedProfile = profiles.find((p) => p.id === profileId);
    const match = matches.find((m) => m.id === matchId);

    if (selectedProfile && match) {
      const teamType = teamId === match.local_team_id ? "local" : "visitor";

      startTransition(() => {
        updateOptimisticMatches({
          matchId,
          teamType,
          profileId,
          username: selectedProfile.username,
        });
      });
    }

    // Ejecutar la acción real
    formAction(formData);
  };

  // Filtrar partidos con planilleros asignados completos
  const assignedMatches = allMatches.filter((match) => (match.planilleros_count || 0) >= 1);

  return (
    <div className="space-y-8">
      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Pendientes ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("assigned")}
            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "assigned"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Asignados ({assignedMatches.length})
          </button>
        </nav>
      </div>

      {/* Pestaña de partidos pendientes */}
      {activeTab === "pending" && (
        <div>
          <h2 className="text-foreground mb-4 text-xl font-semibold">Partidos Pendientes de Asignación</h2>

          {state.message ? (
            <div
              className={`mb-4 rounded p-3 ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="grid gap-6">
            {optimisticMatches.map((match) => (
              <div key={match.id} className="bg-background-header border-border-header rounded-lg border p-6 shadow">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {match.local_team_name} vs {match.visitor_team_name}
                    </h3>
                    <p className="text-foreground">
                      {new Date(match.timestamp).toLocaleDateString("es-CL", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {match.location ? <p className="text-foreground text-sm">📍 {match.location}</p> : null}
                  </div>
                  <div className="text-right">
                    <div className="text-foreground text-sm">Planilleros: {match.planilleros_count || 0}/2</div>
                    <div
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        (match.planilleros_count || 0) === 0
                          ? "bg-red-100 text-red-800"
                          : (match.planilleros_count || 0) === 1
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {(match.planilleros_count || 0) === 0
                        ? "⚠️ Sin planilleros"
                        : (match.planilleros_count || 0) === 1
                          ? "🔄 Falta 1 planillero"
                          : "✅ Completo"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Planillero Equipo Local */}
                  <div className="bg-background rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-foreground font-medium">🏠 {match.local_team_name}</h4>
                      <span className="text-background rounded bg-blue-50 px-2 py-1 text-xs">Local</span>
                    </div>

                    {match.local_planillero ? (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <div>
                              <p className="font-medium text-green-800">✅ Planillero Asignado</p>
                              <p className="text-sm text-green-600">{match.local_planillero.username}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form action={handleAssignPlanillero}>
                        <input type="hidden" name="match_id" value={match.id} />
                        <input type="hidden" name="team_id" value={match.local_team_id} />

                        <div className="space-y-3">
                          <select
                            name="profile_id"
                            className="bg-background focus:ring-primary focus:border-primary w-full rounded-lg border p-3 focus:ring-2"
                            required
                          >
                            <option value="">Seleccionar planillero...</option>
                            {profiles.map((profile: any) => (
                              <option key={profile.id} value={profile.id}>
                                {profile.username}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="bg-primary hover:bg-primary-darken text-background flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors"
                          >
                            <span>👤</span> Asignar Planillero
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Planillero Equipo Visitante */}
                  <div className="bg-background rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-foreground font-medium">✈️ {match.visitor_team_name}</h4>
                      <span className="text-background rounded bg-green-50 px-2 py-1 text-xs">Visitante</span>
                    </div>

                    {match.visitor_planillero ? (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <div>
                              <p className="font-medium text-green-800">✅ Planillero Asignado</p>
                              <p className="text-sm text-green-600">{match.visitor_planillero.username}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form action={handleAssignPlanillero}>
                        <input type="hidden" name="match_id" value={match.id} />
                        <input type="hidden" name="team_id" value={match.visitor_team_id} />

                        <div className="space-y-3">
                          <select
                            name="profile_id"
                            className="bg-background focus:ring-primary focus:border-primary w-full rounded-lg border p-3 focus:ring-2"
                            required
                          >
                            <option value="">Seleccionar planillero...</option>
                            {profiles.map((profile: any) => (
                              <option key={profile.id} value={profile.id}>
                                {profile.username}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="bg-primary hover:bg-primary-darken text-background flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors"
                          >
                            <span>👤</span> Asignar Planillero
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {optimisticMatches.length === 0 && (
            <div className="bg-background-header border-border-header rounded-lg border py-12 text-center shadow">
              <div className="mb-4 text-4xl">✅</div>
              <h3 className="text-foreground mb-2 text-lg font-medium">
                Todos los partidos tienen planilleros asignados
              </h3>
              <p className="text-foreground">No hay partidos pendientes de asignación de planilleros</p>
            </div>
          )}
        </div>
      )}

      {/* Pestaña de partidos con planilleros asignados */}
      {activeTab === "assigned" && (
        <div>
          <h2 className="text-foreground mb-4 text-xl font-semibold">Partidos con Planilleros Asignados</h2>

          {removeState.message || changeState.message ? (
            <div
              className={`mb-4 rounded p-3 ${
                removeState.success || changeState.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {removeState.message || changeState.message}
            </div>
          ) : null}

          <div className="grid gap-6">
            {assignedMatches.map((match) => (
              <div key={match.id} className="bg-background-header border-border-header rounded-lg border p-6 shadow">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {match.local_team_name} vs {match.visitor_team_name}
                    </h3>
                    <p className="text-foreground">
                      {new Date(match.timestamp).toLocaleDateString("es-CL", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {match.location ? <p className="text-foreground text-sm">📍 {match.location}</p> : null}
                  </div>
                  <div className="text-right">
                    <div className="text-foreground text-sm">Planilleros: {match.planilleros_count || 0}/2</div>
                    <div
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        (match.planilleros_count || 0) === 2
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {(match.planilleros_count || 0) === 2 ? "✅ Completo" : "🔄 Parcial"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Planillero Equipo Local */}
                  <div className="bg-background rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-foreground font-medium">🏠 {match.local_team_name}</h4>
                      <span className="text-background rounded bg-blue-50 px-2 py-1 text-xs">Local</span>
                    </div>

                    {match.local_planillero ? (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <div>
                                <p className="text-sm font-medium text-green-800">{match.local_planillero.username}</p>
                                <p className="text-xs text-green-600">
                                  Estado: {match.local_planillero.planillero_status || "assigned"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Opciones para cambiar planillero */}
                        <div className="space-y-2">
                          <form action={changeAction} className="flex gap-2">
                            <input type="hidden" name="match_id" value={match.id} />
                            <input type="hidden" name="team_id" value={match.local_team_id} />
                            <select
                              name="new_profile_id"
                              className="bg-background focus:ring-primary focus:border-primary flex-1 rounded border p-2 text-sm"
                              required
                            >
                              <option value="">Cambiar planillero...</option>
                              {profiles
                                .filter((p) => p.id !== match.local_planillero.profile_id)
                                .map((profile) => (
                                  <option key={profile.id} value={profile.id}>
                                    {profile.username}
                                  </option>
                                ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded bg-blue-500 px-3 py-2 text-xs text-white hover:bg-blue-600"
                            >
                              Cambiar
                            </button>
                          </form>

                          <form action={removeAction}>
                            <input type="hidden" name="match_id" value={match.id} />
                            <input type="hidden" name="team_id" value={match.local_team_id} />
                            <button
                              type="submit"
                              className="w-full rounded bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600"
                              onClick={(e) => {
                                if (!confirm("¿Estás seguro de que quieres remover este planillero?")) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              🗑️ Remover
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">Sin planillero asignado</p>
                      </div>
                    )}
                  </div>

                  {/* Planillero Equipo Visitante */}
                  <div className="bg-background rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-foreground font-medium">✈️ {match.visitor_team_name}</h4>
                      <span className="text-background rounded bg-green-50 px-2 py-1 text-xs">Visitante</span>
                    </div>

                    {match.visitor_planillero ? (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  {match.visitor_planillero.username}
                                </p>
                                <p className="text-xs text-green-600">
                                  Estado: {match.visitor_planillero.planillero_status || "assigned"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Opciones para cambiar planillero */}
                        <div className="space-y-2">
                          <form action={changeAction} className="flex gap-2">
                            <input type="hidden" name="match_id" value={match.id} />
                            <input type="hidden" name="team_id" value={match.visitor_team_id} />
                            <select
                              name="new_profile_id"
                              className="bg-background focus:ring-primary focus:border-primary flex-1 rounded border p-2 text-sm"
                              required
                            >
                              <option value="">Cambiar planillero...</option>
                              {profiles
                                .filter((p) => p.id !== match.visitor_planillero.profile_id)
                                .map((profile) => (
                                  <option key={profile.id} value={profile.id}>
                                    {profile.username}
                                  </option>
                                ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded bg-blue-500 px-3 py-2 text-xs text-white hover:bg-blue-600"
                            >
                              Cambiar
                            </button>
                          </form>

                          <form action={removeAction}>
                            <input type="hidden" name="match_id" value={match.id} />
                            <input type="hidden" name="team_id" value={match.visitor_team_id} />
                            <button
                              type="submit"
                              className="w-full rounded bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600"
                              onClick={(e) => {
                                if (!confirm("¿Estás seguro de que quieres remover este planillero?")) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              🗑️ Remover
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">Sin planillero asignado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {assignedMatches.length === 0 && (
            <div className="bg-background-header border-border-header rounded-lg border py-12 text-center shadow">
              <div className="mb-4 text-4xl">📋</div>
              <h3 className="text-foreground mb-2 text-lg font-medium">No hay partidos con planilleros asignados</h3>
              <p className="text-foreground">Los partidos aparecerán aquí una vez que se asignen planilleros</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-background-header border-border-header mb-8 rounded-lg border p-6">
        <h3 className="text-foreground mb-3 text-lg font-semibold">ℹ️ Instrucciones para Planilleros</h3>
        <div className="text-foreground space-y-2">
          <p>
            • Cada partido necesita <strong>2 planilleros</strong>: uno por cada equipo
          </p>
          <p>• Los planilleros registran eventos solo de su equipo asignado</p>
          <p>• Al finalizar, cada planillero valida la planilla del equipo rival</p>
          <p>• El partido se marca como terminado cuando ambas validaciones son aprobadas</p>
        </div>
      </div>
    </div>
  );
}
