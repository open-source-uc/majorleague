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
  const [selectedPlanilleros, setSelectedPlanilleros] = useState<Record<string, {id: string, username: string} | null>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});


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

  // Manejar clicks fuera del dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      Object.keys(dropdownRefs.current).forEach(key => {
        const ref = dropdownRefs.current[key];
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdowns(prev => ({ ...prev, [key]: false }));
        }
      });
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectPlanillero = (key: string, profile: {id: string, username: string}) => {
    setSelectedPlanilleros(prev => ({ ...prev, [key]: profile }));
    setOpenDropdowns(prev => ({ ...prev, [key]: false }));
  };

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

          <div className="grid gap-6 md:grid-cols-2">
            {optimisticMatches.map((match) => (
              <div key={match.id} className="bg-background-header border-border-header rounded-lg border p-6 shadow">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex flex-col gap-2 my-auto">
                    <h3 className="text-sm font-semibold md:text-lg">
                      {match.local_team_name} vs {match.visitor_team_name}
                    </h3>
                    <p className="text-foreground text-xs md:text-md">
                      {new Date(match.timestamp).toLocaleDateString("es-CL", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {match.location ? <p className="text-foreground text-xs md:text-sm">📍 {match.location}</p> : null}
                  </div>
                  <div className="text-right flex flex-col gap-2 pl-2 md:pl-0">
                    <div className="text-foreground text-xs md:text-sm">Planilleros: {match.planilleros_count || 0}/2</div>
                    <div
                      className={`inline-block rounded-full px-1 py-1 text-xs md:text-sm font-medium text-center md:px-3 ${
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
                      {match.status === "live" ? "🔴 En Vivo" : match.status === "in_review" ? "🔄 En Revisión" : "📅 Programado"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Planillero Equipo Local */}
                  <div className="bg-background-header border-border-header rounded-lg border p-4">
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
                      <form action={(formData: FormData) => {
                        const dropdownKey = `local-${match.id}`;
                        const selectedProfile = selectedPlanilleros[dropdownKey];
                        if (!selectedProfile?.id) {
                          alert("Por favor selecciona un planillero antes de asignar");
                          return;
                        }
                        formData.set("profile_id", selectedProfile.id);
                        handleAssignPlanillero(formData);
                      }}>
                        <input type="hidden" name="match_id" value={match.id} />
                        <input type="hidden" name="team_id" value={match.local_team_id} />

                        <div className="space-y-3">
                          <div 
                            ref={el => { dropdownRefs.current[`local-${match.id}`] = el; }}
                            className="relative"
                          >
                            <button
                              type="button"
                              onClick={() => toggleDropdown(`local-${match.id}`)}
                              className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary w-full rounded-lg border-2 p-3 text-left font-medium focus:ring-2 min-h-[48px] flex items-center justify-between touch-manipulation active:bg-background-header transition-colors"
                            >
                              <span className={selectedPlanilleros[`local-${match.id}`] ? "text-foreground" : "text-foreground/60"}>
                                {selectedPlanilleros[`local-${match.id}`] 
                                  ? selectedPlanilleros[`local-${match.id}`]?.username
                                  : "-- Seleccionar planillero --"
                                }
                              </span>
                              <span className={`transform transition-transform duration-200 ${openDropdowns[`local-${match.id}`] ? "rotate-180" : ""}`}>
                                ▼
                              </span>
                            </button>
                            
                            {openDropdowns[`local-${match.id}`] && profiles.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border-border-header border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {profiles.map((profile: any) => (
                                  <button
                                    key={profile.id}
                                    type="button"
                                    onClick={() => selectPlanillero(`local-${match.id}`, {id: profile.id, username: profile.username})}
                                    className="w-full text-left p-4 hover:bg-background-header active:bg-background-header transition-colors border-b border-border-header last:border-b-0 flex items-center gap-3 min-h-[56px] touch-manipulation"
                                  >
                                    <div className="bg-primary text-background rounded px-2 py-1 text-xs font-bold min-w-[32px] text-center flex-shrink-0">
                                      👤
                                    </div>
                                    <span className="text-foreground font-medium leading-tight">
                                      {profile.username}
                                      {profile.email && <span className="text-foreground/60 ml-1 block text-sm">{profile.email}</span>}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
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
                  <div className="bg-background-header border-border-header rounded-lg border p-4">
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
                      <form action={(formData: FormData) => {
                        const dropdownKey = `visitor-${match.id}`;
                        const selectedProfile = selectedPlanilleros[dropdownKey];
                        if (!selectedProfile?.id) {
                          alert("Por favor selecciona un planillero antes de asignar");
                          return;
                        }
                        formData.set("profile_id", selectedProfile.id);
                        handleAssignPlanillero(formData);
                      }}>
                        <input type="hidden" name="match_id" value={match.id} />
                        <input type="hidden" name="team_id" value={match.visitor_team_id} />

                        <div className="space-y-3">
                          <div 
                            ref={el => { dropdownRefs.current[`visitor-${match.id}`] = el; }}
                            className="relative"
                          >
                            <button
                              type="button"
                              onClick={() => toggleDropdown(`visitor-${match.id}`)}
                              className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary w-full rounded-lg border-2 p-3 text-left font-medium focus:ring-2 min-h-[48px] flex items-center justify-between touch-manipulation active:bg-background-header transition-colors"
                            >
                              <span className={selectedPlanilleros[`visitor-${match.id}`] ? "text-foreground" : "text-foreground/60"}>
                                {selectedPlanilleros[`visitor-${match.id}`] 
                                  ? selectedPlanilleros[`visitor-${match.id}`]?.username
                                  : "-- Seleccionar planillero --"
                                }
                              </span>
                              <span className={`transform transition-transform duration-200 ${openDropdowns[`visitor-${match.id}`] ? "rotate-180" : ""}`}>
                                ▼
                              </span>
                            </button>
                            
                            {openDropdowns[`visitor-${match.id}`] && profiles.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border-border-header border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {profiles.map((profile: any) => (
                                  <button
                                    key={profile.id}
                                    type="button"
                                    onClick={() => selectPlanillero(`visitor-${match.id}`, {id: profile.id, username: profile.username})}
                                    className="w-full text-left p-4 hover:bg-background-header active:bg-background-header transition-colors border-b border-border-header last:border-b-0 flex items-center gap-3 min-h-[56px] touch-manipulation"
                                  >
                                    <div className="bg-primary text-background rounded px-2 py-1 text-xs font-bold min-w-[32px] text-center flex-shrink-0">
                                      👤
                                    </div>
                                    <span className="text-foreground font-medium leading-tight">
                                      {profile.username}
                                      {profile.email && <span className="text-foreground/60 ml-1 block text-sm">{profile.email}</span>}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
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
                  <div className="flex flex-col gap-2 my-auto">
                    <h3 className="text-sm font-semibold md:text-lg">
                      {match.local_team_name} vs {match.visitor_team_name}
                    </h3>
                    <p className="text-foreground text-xs md:text-md">
                      {new Date(match.timestamp).toLocaleDateString("es-CL", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {match.location ? <p className="text-foreground text-xs md:text-sm">📍 {match.location}</p> : null}
                  </div>    
                  <div className="text-right flex flex-col gap-2 pl-2 md:pl-0">
                    <div className="text-foreground text-xs md:text-sm">Planilleros: {match.planilleros_count || 0}/2</div>
                    <div
                      className={`inline-block rounded-full px-1 py-1 text-xs md:text-sm font-medium text-center md:px-3 ${
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
                  <div className="bg-background-header border-border-header rounded-lg border p-4">
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
                          <form action={(formData: FormData) => {
                            const dropdownKey = `change-local-${match.id}`;
                            const selectedProfile = selectedPlanilleros[dropdownKey];
                            if (!selectedProfile?.id) {
                              alert("Por favor selecciona un planillero antes de cambiar");
                              return;
                            }
                            formData.set("new_profile_id", selectedProfile.id);
                            changeAction(formData);
                          }} className="flex flex-col gap-2 sm:flex-row">
                            <input type="hidden" name="match_id" value={match.id} />
                            <input type="hidden" name="team_id" value={match.local_team_id} />
                            
                            <div 
                              ref={el => { dropdownRefs.current[`change-local-${match.id}`] = el; }}
                              className="relative flex-1"
                            >
                              <button
                                type="button"
                                onClick={() => toggleDropdown(`change-local-${match.id}`)}
                                className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary w-full rounded border-2 p-2 text-left text-sm font-medium focus:ring-2 min-h-[36px] flex items-center justify-between touch-manipulation active:bg-background-header transition-colors"
                              >
                                <span className={selectedPlanilleros[`change-local-${match.id}`] ? "text-foreground" : "text-foreground/60"}>
                                  {selectedPlanilleros[`change-local-${match.id}`] 
                                    ? selectedPlanilleros[`change-local-${match.id}`]?.username
                                    : "Cambiar planillero..."
                                  }
                                </span>
                                <span className={`transform transition-transform duration-200 text-xs ${openDropdowns[`change-local-${match.id}`] ? "rotate-180" : ""}`}>
                                  ▼
                                </span>
                              </button>
                              
                              {openDropdowns[`change-local-${match.id}`] && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border-border-header border-2 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                  {profiles
                                    .filter((p) => p.id !== match.local_planillero.profile_id)
                                    .map((profile: any) => (
                                      <button
                                        key={profile.id}
                                        type="button"
                                        onClick={() => selectPlanillero(`change-local-${match.id}`, {id: profile.id, username: profile.username})}
                                        className="w-full text-left p-3 hover:bg-background-header active:bg-background-header transition-colors border-b border-border-header last:border-b-0 flex items-center gap-2 min-h-[44px] touch-manipulation"
                                      >
                                        <div className="bg-primary text-background rounded px-1.5 py-0.5 text-xs font-bold min-w-[24px] text-center flex-shrink-0">
                                          👤
                                        </div>
                                        <span className="text-foreground text-sm font-medium leading-tight">
                                          {profile.username}
                                        </span>
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                            
                            <button
                              type="submit"
                              className="rounded bg-blue-500 px-3 py-2 text-xs text-white hover:bg-blue-600 min-h-[36px] flex-shrink-0"
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
                        <p className="text-sm text-gray-600">Sin planillero asignado, vuelve a la pestaña de partidos pendientes para asignar un planillero</p>
                      </div>
                    )}
                  </div>

                  {/* Planillero Equipo Visitante */}
                  <div className="bg-background-header border-border-header rounded-lg border p-4">
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
                          <form action={(formData: FormData) => {
                            const dropdownKey = `change-visitor-${match.id}`;
                            const selectedProfile = selectedPlanilleros[dropdownKey];
                            if (!selectedProfile?.id) {
                              alert("Por favor selecciona un planillero antes de cambiar");
                              return;
                            }
                            formData.set("new_profile_id", selectedProfile.id);
                            changeAction(formData);
                          }} className="flex flex-col gap-2 sm:flex-row">
                            <input type="hidden" name="match_id" value={match.id} />
                            <input type="hidden" name="team_id" value={match.visitor_team_id} />
                            
                            <div 
                              ref={el => { dropdownRefs.current[`change-visitor-${match.id}`] = el; }}
                              className="relative flex-1"
                            >
                              <button
                                type="button"
                                onClick={() => toggleDropdown(`change-visitor-${match.id}`)}
                                className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary w-full rounded border-2 p-2 text-left text-sm font-medium focus:ring-2 min-h-[36px] flex items-center justify-between touch-manipulation active:bg-background-header transition-colors"
                              >
                                <span className={selectedPlanilleros[`change-visitor-${match.id}`] ? "text-foreground" : "text-foreground/60"}>
                                  {selectedPlanilleros[`change-visitor-${match.id}`] 
                                    ? selectedPlanilleros[`change-visitor-${match.id}`]?.username
                                    : "Cambiar planillero..."
                                  }
                                </span>
                                <span className={`transform transition-transform duration-200 text-xs ${openDropdowns[`change-visitor-${match.id}`] ? "rotate-180" : ""}`}>
                                  ▼
                                </span>
                              </button>
                              
                              {openDropdowns[`change-visitor-${match.id}`] && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border-border-header border-2 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                  {profiles
                                    .filter((p) => p.id !== match.visitor_planillero.profile_id)
                                    .map((profile: any) => (
                                      <button
                                        key={profile.id}
                                        type="button"
                                        onClick={() => selectPlanillero(`change-visitor-${match.id}`, {id: profile.id, username: profile.username})}
                                        className="w-full text-left p-3 hover:bg-background-header active:bg-background-header transition-colors border-b border-border-header last:border-b-0 flex items-center gap-2 min-h-[44px] touch-manipulation"
                                      >
                                        <div className="bg-primary text-background rounded px-1.5 py-0.5 text-xs font-bold min-w-[24px] text-center flex-shrink-0">
                                          👤
                                        </div>
                                        <span className="text-foreground text-sm font-medium leading-tight">
                                          {profile.username}
                                        </span>
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                            
                            <button
                              type="submit"
                              className="rounded bg-blue-500 px-3 py-2 text-xs text-white hover:bg-blue-600 min-h-[36px] flex-shrink-0"
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
                        <p className="text-sm text-gray-600">Sin planillero asignado, vuelve a la pestaña de partidos pendientes para asignar un planillero</p>
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
