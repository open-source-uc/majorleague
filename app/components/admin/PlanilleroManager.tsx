"use client";

import { useActionState, useOptimistic, startTransition, useState, useRef, useEffect } from "react";

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
  const [selectedPlanilleros, setSelectedPlanilleros] = useState<
    Record<string, { id: string; username: string } | null>
  >({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Optimistic updates para reflejar cambios inmediatamente
  const [optimisticMatches, updateOptimisticMatches] = useOptimistic(
    matches,
    (
      state,
      {
        matchId,
        profileId,
        username,
      }: {
        matchId: number;
        profileId: string;
        username: string;
      },
    ) => {
      return state.map((match) => {
        if (match.id === matchId) {
          const updatedMatch = { ...match };
          // Add new planillero to the list
          updatedMatch.planilleros = [
            ...(updatedMatch.planilleros || []),
            {
              profile_id: profileId,
              username,
              planillero_status: "assigned",
            },
          ];
          // Actualizar contador
          updatedMatch.planilleros_count = (match.planilleros_count || 0) + 1;
          return updatedMatch;
        }
        return match;
      });
    },
  );

  // Manejar clicks fuera del dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      Object.keys(dropdownRefs.current).forEach((key) => {
        const ref = dropdownRefs.current[key];
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdowns((prev) => ({ ...prev, [key]: false }));
        }
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectPlanillero = (key: string, profile: { id: string; username: string }) => {
    setSelectedPlanilleros((prev) => ({ ...prev, [key]: profile }));
    setOpenDropdowns((prev) => ({ ...prev, [key]: false }));
  };

  const handleAssignPlanillero = (formData: FormData) => {
    const matchId = parseInt(formData.get("match_id") as string);
    const profileId = formData.get("profile_id") as string;

    const selectedProfile = profiles.find((p) => p.id === profileId);

    if (selectedProfile) {
      startTransition(() => {
        updateOptimisticMatches({
          matchId,
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

          <div className="grid gap-6 md:grid-cols-2">
            {optimisticMatches.map((match) => (
              <div key={match.id} className="bg-background-header border-border-header rounded-lg border p-6 shadow">
                <div className="mb-4 flex items-start justify-between">
                  <div className="my-auto flex flex-col gap-2">
                    <h3 className="text-sm font-semibold md:text-lg">
                      {match.local_team_name} vs {match.visitor_team_name}
                    </h3>
                    <p className="text-foreground md:text-md text-xs">
                      {(() => {
                        const raw = String(match.timestamp);
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
                    {match.location ? <p className="text-foreground text-xs md:text-sm">📍 {match.location}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2 pl-2 text-right md:pl-0">
                    <div className="text-foreground text-xs md:text-sm">
                      Planilleros: {match.planilleros_count || 0}/2
                    </div>
                    <div
                      className={`inline-block rounded-full px-1 py-1 text-center text-xs font-medium md:px-3 md:text-sm ${
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
                    <div className="text-foreground text-xs md:text-sm">
                      {match.status === "live"
                        ? "🔴 En Vivo"
                        : match.status === "admin_review"
                          ? "⚖️ Revisión Admin"
                          : "📅 Programado"}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-foreground mb-3 font-medium">Planilleros Asignados:</h4>
                  {match.planilleros && match.planilleros.length > 0 ? (
                    <div className="space-y-2">
                      {match.planilleros.map((planillero: any, index: number) => (
                        <div key={index} className="rounded-lg border border-green-200 bg-green-50 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 rounded-full bg-green-500" />
                              <div>
                                <p className="font-medium text-green-800">✅ {planillero.username}</p>
                                <p className="text-sm text-green-600">
                                  Estado: {planillero.planillero_status || "assigned"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-600">No hay planilleros asignados</p>
                    </div>
                  )}
                </div>

                {(match.planilleros_count || 0) < 2 && (
                  <div className="bg-background-header border-border-header rounded-lg border p-4">
                    <h4 className="text-foreground mb-3 font-medium">Asignar Planillero:</h4>
                    <form
                      action={(formData: FormData) => {
                        const dropdownKey = `assign-${match.id}`;
                        const selectedProfile = selectedPlanilleros[dropdownKey];
                        if (!selectedProfile?.id) {
                          alert("Por favor selecciona un planillero antes de asignar");
                          return;
                        }
                        formData.set("profile_id", selectedProfile.id);
                        handleAssignPlanillero(formData);
                      }}
                    >
                      <input type="hidden" name="match_id" value={match.id} />

                      <div className="space-y-3">
                        <div
                          ref={(el) => {
                            dropdownRefs.current[`assign-${match.id}`] = el;
                          }}
                          className="relative"
                        >
                          <button
                            type="button"
                            onClick={() => toggleDropdown(`assign-${match.id}`)}
                            className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary active:bg-background-header flex min-h-[48px] w-full touch-manipulation items-center justify-between rounded-lg border-2 p-3 text-left font-medium transition-colors focus:ring-2"
                          >
                            <span
                              className={
                                selectedPlanilleros[`assign-${match.id}`] ? "text-foreground" : "text-foreground/60"
                              }
                            >
                              {selectedPlanilleros[`assign-${match.id}`]
                                ? selectedPlanilleros[`assign-${match.id}`]?.username
                                : "-- Seleccionar planillero --"}
                            </span>
                            <span
                              className={`transform transition-transform duration-200 ${openDropdowns[`assign-${match.id}`] ? "rotate-180" : ""}`}
                            >
                              ▼
                            </span>
                          </button>

                          {openDropdowns[`assign-${match.id}`] && profiles.length > 0 ? (
                            <div className="bg-background border-border-header absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border-2 shadow-lg">
                              {profiles
                                .filter(
                                  (profile) => !(match.planilleros || []).some((p: any) => p.profile_id === profile.id),
                                )
                                .map((profile: any) => (
                                  <button
                                    key={profile.id}
                                    type="button"
                                    onClick={() =>
                                      selectPlanillero(`assign-${match.id}`, {
                                        id: profile.id,
                                        username: profile.username,
                                      })
                                    }
                                    className="hover:bg-background-header active:bg-background-header border-border-header flex min-h-[56px] w-full touch-manipulation items-center gap-3 border-b p-4 text-left transition-colors last:border-b-0"
                                  >
                                    <div className="bg-primary text-background min-w-[32px] flex-shrink-0 rounded px-2 py-1 text-center text-xs font-bold">
                                      👤
                                    </div>
                                    <span className="text-foreground leading-tight font-medium">
                                      {profile.username}
                                      {profile.email ? (
                                        <span className="text-foreground/60 ml-1 block text-sm">{profile.email}</span>
                                      ) : null}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          ) : null}
                        </div>

                        <button
                          type="submit"
                          className="bg-primary hover:bg-primary-darken text-background flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors"
                        >
                          <span>👤</span> Asignar Planillero
                        </button>
                      </div>
                    </form>
                  </div>
                )}
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
                  <div className="my-auto flex flex-col gap-2">
                    <h3 className="text-sm font-semibold md:text-lg">
                      {match.local_team_name} vs {match.visitor_team_name}
                    </h3>
                    <p className="text-foreground md:text-md text-xs">
                      {(() => {
                        const raw = String(match.timestamp);
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
                    {match.location ? <p className="text-foreground text-xs md:text-sm">📍 {match.location}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2 pl-2 text-right md:pl-0">
                    <div className="text-foreground text-xs md:text-sm">
                      Planilleros: {match.planilleros_count || 0}/2
                    </div>
                    <div
                      className={`inline-block rounded-full px-1 py-1 text-center text-xs font-medium md:px-3 md:text-sm ${
                        (match.planilleros_count || 0) === 2
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {(match.planilleros_count || 0) === 2 ? "✅ Completo" : "🔄 Parcial"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-background-header border-border-header rounded-lg border p-4">
                    <h4 className="text-foreground mb-3 font-medium">Planilleros Asignados:</h4>

                    {match.planilleros && match.planilleros.length > 0 ? (
                      <div className="space-y-2">
                        {match.planilleros.map((planillero: any, index: number) => (
                          <div key={index} className="space-y-3">
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                  <div>
                                    <p className="text-sm font-medium text-green-800">{planillero.username}</p>
                                    <p className="text-xs text-green-600">
                                      Estado: {planillero.planillero_status || "assigned"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Opciones para cambiar/remover planillero */}
                            <div className="flex gap-2">
                              <form
                                action={(formData: FormData) => {
                                  const dropdownKey = `change-${match.id}-${index}`;
                                  const selectedProfile = selectedPlanilleros[dropdownKey];
                                  if (!selectedProfile?.id) {
                                    alert("Por favor selecciona un planillero antes de cambiar");
                                    return;
                                  }
                                  formData.set("old_profile_id", planillero.profile_id);
                                  formData.set("new_profile_id", selectedProfile.id);
                                  changeAction(formData);
                                }}
                                className="flex flex-1 gap-2"
                              >
                                <input type="hidden" name="match_id" value={match.id} />

                                <div
                                  ref={(el) => {
                                    dropdownRefs.current[`change-${match.id}-${index}`] = el;
                                  }}
                                  className="relative flex-1"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleDropdown(`change-${match.id}-${index}`)}
                                    className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary active:bg-background-header flex min-h-[32px] w-full touch-manipulation items-center justify-between rounded border p-2 text-left text-xs font-medium transition-colors focus:ring-1"
                                  >
                                    <span
                                      className={
                                        selectedPlanilleros[`change-${match.id}-${index}`]
                                          ? "text-foreground"
                                          : "text-foreground/60"
                                      }
                                    >
                                      {selectedPlanilleros[`change-${match.id}-${index}`]
                                        ? selectedPlanilleros[`change-${match.id}-${index}`]?.username
                                        : "Cambiar..."}
                                    </span>
                                    <span
                                      className={`transform text-xs transition-transform duration-200 ${openDropdowns[`change-${match.id}-${index}`] ? "rotate-180" : ""}`}
                                    >
                                      ▼
                                    </span>
                                  </button>

                                  {openDropdowns[`change-${match.id}-${index}`] ? (
                                    <div className="bg-background border-border-header absolute top-full right-0 left-0 z-50 mt-1 max-h-40 overflow-y-auto rounded-lg border-2 shadow-lg">
                                      {profiles
                                        .filter(
                                          (p) =>
                                            p.id !== planillero.profile_id &&
                                            !match.planilleros.some((mp: any) => mp.profile_id === p.id),
                                        )
                                        .map((profile: any) => (
                                          <button
                                            key={profile.id}
                                            type="button"
                                            onClick={() =>
                                              selectPlanillero(`change-${match.id}-${index}`, {
                                                id: profile.id,
                                                username: profile.username,
                                              })
                                            }
                                            className="hover:bg-background-header active:bg-background-header border-border-header flex min-h-[40px] w-full touch-manipulation items-center gap-2 border-b p-2 text-left transition-colors last:border-b-0"
                                          >
                                            <div className="bg-primary text-background min-w-[20px] flex-shrink-0 rounded px-1 py-0.5 text-center text-xs font-bold">
                                              👤
                                            </div>
                                            <span className="text-foreground text-xs leading-tight font-medium">
                                              {profile.username}
                                            </span>
                                          </button>
                                        ))}
                                    </div>
                                  ) : null}
                                </div>

                                <button
                                  type="submit"
                                  className="min-h-[32px] flex-shrink-0 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                                >
                                  Cambiar
                                </button>
                              </form>

                              <form action={removeAction}>
                                <input type="hidden" name="match_id" value={match.id} />
                                <input type="hidden" name="profile_id" value={planillero.profile_id} />
                                <button
                                  type="submit"
                                  className="min-h-[32px] rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                  onClick={(e) => {
                                    if (!confirm("¿Estás seguro de que quieres remover este planillero?")) {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  🗑️
                                </button>
                              </form>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">
                          Sin planilleros asignados, vuelve a la pestaña de partidos pendientes para asignar planilleros
                        </p>
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
        <h3 className="text-foreground mb-3 text-lg font-semibold">ℹ️ Nuevo Sistema de Planilleros</h3>
        <div className="text-foreground space-y-2">
          <p>
            • Cada partido necesita <strong>2 planilleros</strong> que trabajarán colaborativamente
          </p>
          <p>• Ambos planilleros pueden registrar asistencia y eventos de ambos equipos</p>
          <p>• Cuando ambos completan su trabajo, deben validar/aprobar los datos conjuntamente</p>
          <p>
            • Una vez que ambos planilleros aprueban, el partido va a <strong>revisión administrativa</strong>
          </p>
          <p>• El administrador da la aprobación final para que el partido sea marcado como terminado</p>
        </div>
      </div>
    </div>
  );
}
