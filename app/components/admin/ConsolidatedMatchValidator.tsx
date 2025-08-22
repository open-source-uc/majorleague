"use client";

import { useActionState, useEffect, useState, useTransition } from "react";

import { getMatchComparisonData, validateMatchWithConsolidatedData } from "@/actions/planilleros";

interface Attendance {
  player_id: number;
  first_name: string;
  last_name: string;
  team_id: number;
  team_name: string;
  status: string;
  jersey_number?: number;
  source?: "planillero1" | "planillero2" | "both" | "conflict";
  conflict?: boolean;
}

interface Event {
  team_id: number;
  player_id: number;
  first_name: string;
  last_name: string;
  team_name: string;
  type: string;
  minute: number;
  description?: string;
  source?: "planillero1" | "planillero2" | "both" | "conflict";
  conflict?: boolean;
}

interface ValidationError {
  type: "attendance_event_conflict" | "duplicate_jersey" | "invalid_minute";
  message: string;
  playerId?: number;
  eventIndex?: number;
}

interface MatchValidatorProps {
  matchId: number;
  adminValidation?: any;
  localTeamName: string;
  visitorTeamName: string;
}

export function MatchValidator({ matchId, adminValidation, localTeamName, visitorTeamName }: MatchValidatorProps) {
  const [state, formAction] = useActionState(validateMatchWithConsolidatedData, {
    success: 0,
    errors: 0,
    message: "",
  });

  const [isPending, startTransition] = useTransition();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState("");

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [editMinute, setEditMinute] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [selectedAttendanceChoices, setSelectedAttendanceChoices] = useState<{
    [playerId: number]: "planillero1" | "planillero2";
  }>({});
  const [selectedEventChoices, setSelectedEventChoices] = useState<{
    [eventIndex: number]: "planillero1" | "planillero2";
  }>({});

  useEffect(() => {
    const loadComparisonData = async () => {
      try {
        const data = await getMatchComparisonData(matchId);
        setComparisonData(data);

        if (data) {
          const attendanceMap = new Map<number, Attendance>();

          data.planillero1.attendance.forEach((att: any) => {
            attendanceMap.set(att.player_id, {
              ...att,
              source: "planillero1",
            });
          });

          data.planillero2.attendance.forEach((att: any) => {
            const existing = attendanceMap.get(att.player_id);
            if (existing) {
              if (existing.status === att.status && existing.jersey_number === att.jersey_number) {
                existing.source = "both";
              } else {
                existing.source = "conflict";
                existing.conflict = true;
              }
            } else {
              attendanceMap.set(att.player_id, {
                ...att,
                source: "planillero2",
              });
            }
          });

          setAttendance(Array.from(attendanceMap.values()));
          const eventMap = new Map<string, Event>();

          data.planillero1.events.forEach((event: any) => {
            const key = `${event.team_id}-${event.player_id}-${event.type}-${event.minute}`;
            eventMap.set(key, {
              ...event,
              source: "planillero1",
            });
          });

          data.planillero2.events.forEach((event: any) => {
            const key = `${event.team_id}-${event.player_id}-${event.type}-${event.minute}`;
            const existing = eventMap.get(key);
            if (existing) {
              existing.source = "both";
            } else {
              eventMap.set(key, {
                ...event,
                source: "planillero2",
              });
            }
          });

          setEvents(Array.from(eventMap.values()));
        }
      } catch (error) {
        console.error("Error loading comparison data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!adminValidation) {
      loadComparisonData();
    } else {
      setLoading(false);
    }
  }, [matchId, adminValidation]);

  useEffect(() => {
    const errors: ValidationError[] = [];

    events.forEach((event, eventIndex) => {
      const playerAttendance = attendance.find((att) => att.player_id === event.player_id);
      if (playerAttendance && playerAttendance.status === "absent") {
        errors.push({
          type: "attendance_event_conflict",
          message: `${event.first_name} ${event.last_name} está marcado como ausente pero tiene eventos registrados`,
          playerId: event.player_id,
          eventIndex,
        });
      }
    });

    const jerseyNumbers = new Map<number, Attendance[]>();
    attendance.forEach((att) => {
      if (att.jersey_number && att.status !== "absent") {
        if (!jerseyNumbers.has(att.jersey_number)) {
          jerseyNumbers.set(att.jersey_number, []);
        }
        jerseyNumbers.get(att.jersey_number)!.push(att);
      }
    });

    jerseyNumbers.forEach((players, jerseyNumber) => {
      if (players.length > 1) {
        errors.push({
          type: "duplicate_jersey",
          message: `Número de camiseta ${jerseyNumber} duplicado entre: ${players.map((p) => `${p.first_name} ${p.last_name}`).join(", ")}`,
        });
      }
    });

    events.forEach((event, eventIndex) => {
      if (event.minute < 0 || event.minute > 120) {
        errors.push({
          type: "invalid_minute",
          message: `Minuto inválido (${event.minute}) para evento de ${event.first_name} ${event.last_name}`,
          eventIndex,
        });
      }
    });

    setValidationErrors(errors);
  }, [attendance, events]);

  // Handle choice selection for conflicts
  const handleAttendanceChoiceChange = (playerId: number, choice: "planillero1" | "planillero2", checked: boolean) => {
    setSelectedAttendanceChoices((prev) => {
      const newChoices = { ...prev };
      if (checked) {
        newChoices[playerId] = choice;
      } else {
        delete newChoices[playerId];
      }
      return newChoices;
    });
  };

  const handleEventChoiceChange = (eventIndex: number, choice: "planillero1" | "planillero2", checked: boolean) => {
    setSelectedEventChoices((prev) => {
      const newChoices = { ...prev };
      if (checked) {
        newChoices[eventIndex] = choice;
      } else {
        delete newChoices[eventIndex];
      }
      return newChoices;
    });
  };

  // Reset all selections
  const resetAllSelections = () => {
    setSelectedAttendanceChoices({});
    setSelectedEventChoices({});
  };

  // Handle minute editing
  const startEditingMinute = (eventIndex: number) => {
    setEditingEvent(eventIndex);
    setEditMinute(events[eventIndex].minute);
  };

  const saveMinuteEdit = () => {
    if (editingEvent !== null) {
      setEvents((prev) =>
        prev.map((event, index) => (index === editingEvent ? { ...event, minute: editMinute } : event)),
      );
      setEditingEvent(null);
    }
  };

  const removeEvent = (eventIndex: number) => {
    setEvents((prev) => prev.filter((_, index) => index !== eventIndex));
    setSelectedEventChoices((prev) => {
      const newChoices = { ...prev };
      delete newChoices[eventIndex];
      const reindexed: typeof newChoices = {};
      Object.entries(newChoices).forEach(([oldIndex, choice]) => {
        const numIndex = parseInt(oldIndex);
        if (numIndex > eventIndex) {
          reindexed[numIndex - 1] = choice;
        } else if (numIndex < eventIndex) {
          reindexed[numIndex] = choice;
        }
      });
      return reindexed;
    });
  };

  const getEventSummary = () => {
    const finalEvents = events.filter((event, index) => {
      if (event.source === "both") {
        return true;
      }

      const selectedChoice = selectedEventChoices[index];
      if (!selectedChoice || !comparisonData) {
        return false;
      }

      const selectedPlanilleroEvents =
        selectedChoice === "planillero1" ? comparisonData.planillero1.events : comparisonData.planillero2.events;

      return selectedPlanilleroEvents.some(
        (e: any) =>
          e.team_id === event.team_id &&
          e.player_id === event.player_id &&
          e.type === event.type &&
          e.minute === event.minute,
      );
    });

    const localEvents = finalEvents.filter((e) => e.team_name === localTeamName);
    const visitorEvents = finalEvents.filter((e) => e.team_name === visitorTeamName);

    const countEventType = (events: Event[], type: string) => events.filter((e) => e.type === type).length;

    return {
      local: {
        goals: countEventType(localEvents, "goal"),
        yellowCards: countEventType(localEvents, "yellow_card"),
        redCards: countEventType(localEvents, "red_card"),
      },
      visitor: {
        goals: countEventType(visitorEvents, "goal"),
        yellowCards: countEventType(visitorEvents, "yellow_card"),
        redCards: countEventType(visitorEvents, "red_card"),
      },
    };
  };

  const submitWithData = () => {
    startTransition(() => {
      const form = document.createElement("form");
      form.style.display = "none";

      const addHiddenField = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      const finalAttendance = attendance
        .filter((att) => {
          if (att.source === "both") {
            return true;
          }

          const choice = selectedAttendanceChoices[att.player_id];
          if (!choice || !comparisonData) {
            return false;
          }

          const sourceData =
            choice === "planillero1"
              ? comparisonData.planillero1.attendance.find((a: any) => a.player_id === att.player_id)
              : comparisonData.planillero2.attendance.find((a: any) => a.player_id === att.player_id);

          return sourceData !== undefined;
        })
        .map((att) => {
          if (att.source === "both") {
            return att;
          }

          const choice = selectedAttendanceChoices[att.player_id];
          if (choice && comparisonData) {
            const sourceData =
              choice === "planillero1"
                ? comparisonData.planillero1.attendance.find((a: any) => a.player_id === att.player_id)
                : comparisonData.planillero2.attendance.find((a: any) => a.player_id === att.player_id);

            return sourceData ? { ...att, ...sourceData } : att;
          }

          return att;
        });

      const finalEvents = events
        .filter((event, index) => {
          if (event.source === "both") {
            return true;
          }

          const choice = selectedEventChoices[index];
          if (!choice || !comparisonData) {
            return false;
          }

          const selectedPlanilleroEvents =
            choice === "planillero1" ? comparisonData.planillero1.events : comparisonData.planillero2.events;

          return selectedPlanilleroEvents.some(
            (e: any) =>
              e.team_id === event.team_id &&
              e.player_id === event.player_id &&
              e.type === event.type &&
              e.minute === event.minute,
          );
        })
        .map((event, filteredIndex) => {
          const originalIndex = events.findIndex((e) => e === event);
          const choice = selectedEventChoices[originalIndex];

          if (event.source === "both" || !choice || !comparisonData) {
            return event;
          }

          const originalEvents =
            choice === "planillero1" ? comparisonData.planillero1.events : comparisonData.planillero2.events;

          const originalEvent = originalEvents.find(
            (e: any) =>
              e.team_id === event.team_id &&
              e.player_id === event.player_id &&
              e.type === event.type &&
              e.minute === event.minute,
          );

          return originalEvent || event;
        });

      addHiddenField("match_id", matchId.toString());
      addHiddenField("comments", comments);
      addHiddenField("attendance_data", JSON.stringify(finalAttendance));
      addHiddenField("events_data", JSON.stringify(finalEvents));

      document.body.appendChild(form);
      const formData = new FormData(form);
      formAction(formData);
      document.body.removeChild(form);
    });
  };

  if (adminValidation) {
    return (
      <div className="from-background via-card to-background relative overflow-hidden rounded-xl bg-gradient-to-br p-4 shadow-xl md:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="bg-primary absolute top-1/4 left-1/4 h-32 w-32 rounded-full blur-2xl" />
          <div className="bg-accent absolute right-1/4 bottom-1/4 h-24 w-24 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="from-primary to-accent flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r md:h-12 md:w-12">
              <span className="text-xl md:text-2xl">⚖️</span>
            </div>
            <h3 className="text-foreground text-xl font-bold md:text-2xl">Validación Administrativa</h3>
          </div>

          <div
            className={`rounded-xl border p-4 md:p-6 ${
              adminValidation.status === "approved"
                ? "border-green-500/30 bg-green-50/50 text-green-900"
                : "border-red-500/30 bg-red-50/50 text-red-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl md:text-2xl">{adminValidation.status === "approved" ? "✅" : "❌"}</span>
              <span className="text-lg font-semibold md:text-xl">
                {adminValidation.status === "approved" ? "Partido Aprobado" : "Partido Rechazado"}
              </span>
            </div>
            {adminValidation.comments ? (
              <p className="mt-4 text-sm italic md:text-base">&quot;{adminValidation.comments}&quot;</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="from-background via-card to-background relative overflow-hidden rounded-xl bg-gradient-to-br p-4 shadow-xl md:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="bg-primary absolute top-1/4 left-1/4 h-32 w-32 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="from-primary to-accent mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r md:h-16 md:w-16">
            <span className="text-2xl md:text-3xl">⏳</span>
          </div>
          <h3 className="text-foreground mb-4 text-xl font-bold md:text-2xl">Cargando Datos de Comparación</h3>
          <p className="text-muted-foreground text-sm md:text-base">Analizando las planillas de ambos planilleros...</p>
        </div>
      </div>
    );
  }

  const hasConflicts =
    attendance.some((att) => att.source === "conflict") ||
    attendance.some((att) => att.source !== "both") ||
    events.some((event) => event.source !== "both");

  const hasErrors = validationErrors.length > 0;
  const eventSummary = getEventSummary();

  const conflictingAttendance = attendance.filter(
    (att) => att.source === "conflict" || att.source === "planillero1" || att.source === "planillero2",
  );

  const unResolvedAttendanceConflicts = conflictingAttendance.filter(
    (att) => !selectedAttendanceChoices[att.player_id],
  );
  const unResolvedEventConflicts = events.filter((event, index) => {
    return event.source !== "both" && !selectedEventChoices[index];
  });

  const hasUnresolvedConflicts = unResolvedAttendanceConflicts.length > 0 || unResolvedEventConflicts.length > 0;

  return (
    <div className="from-background via-card to-background relative overflow-hidden rounded-xl bg-gradient-to-br p-4 shadow-xl md:p-8">
      <div className="absolute inset-0 opacity-10">
        <div className="bg-primary absolute top-1/4 left-1/4 h-32 w-32 rounded-full blur-2xl" />
        <div className="bg-accent absolute right-1/4 bottom-1/4 h-24 w-24 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 space-y-6 md:space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="from-primary to-accent flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r md:h-12 md:w-12">
            <span className="text-xl md:text-2xl">⚖️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-foreground text-xl font-bold md:text-2xl">Validación de Datos</h3>
            <p className="text-muted-foreground text-sm md:text-base">Revisión administrativa de planillas</p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-50/50 p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <span className="text-2xl md:text-3xl">🔍</span>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-foreground text-base font-semibold md:text-lg">
                  Estado: {hasConflicts ? "Diferencias Detectadas" : "Datos Coincidentes"}
                </p>
                {hasConflicts ? (
                  <button
                    onClick={resetAllSelections}
                    className="rounded-lg bg-gray-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-700 md:text-sm"
                  >
                    🔄 Limpiar Selecciones
                  </button>
                ) : null}
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                {hasConflicts ? (
                  hasUnresolvedConflicts ? (
                    <>
                      ⚠️ Faltan marcar {unResolvedAttendanceConflicts.length + unResolvedEventConflicts.length}{" "}
                      diferencias. Selecciona qué datos usar.
                    </>
                  ) : (
                    <>✅ Todas las diferencias han sido resueltas. Listo para finalizar.</>
                  )
                ) : (
                  <>✅ Ambos planilleros registraron los mismos datos.</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="rounded-xl border border-green-500/30 bg-green-50/50 p-4 md:p-6">
            <h4 className="text-foreground mb-3 text-base font-semibold md:mb-4 md:text-lg">{localTeamName}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl">⚽</span>
                <span className="text-sm font-medium md:text-base">{eventSummary.local.goals} Goles</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl">🟨</span>
                <span className="text-sm font-medium md:text-base">
                  {eventSummary.local.yellowCards} Tarjetas Amarillas
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl">🟥</span>
                <span className="text-sm font-medium md:text-base">{eventSummary.local.redCards} Tarjetas Rojas</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-50/50 p-4 md:p-6">
            <h4 className="text-foreground mb-3 text-base font-semibold md:mb-4 md:text-lg">{visitorTeamName}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl">⚽</span>
                <span className="text-sm font-medium md:text-base">{eventSummary.visitor.goals} Goles</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl">🟨</span>
                <span className="text-sm font-medium md:text-base">
                  {eventSummary.visitor.yellowCards} Tarjetas Amarillas
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl">🟥</span>
                <span className="text-sm font-medium md:text-base">{eventSummary.visitor.redCards} Tarjetas Rojas</span>
              </div>
            </div>
          </div>
        </div>

        {hasErrors ? (
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-foreground flex items-center gap-3 text-lg font-semibold md:text-xl">
              <span className="text-xl md:text-2xl">⚠️</span>
              Problemas Detectados
            </h4>
            {validationErrors.map((error, index) => (
              <div key={index} className="rounded-xl border border-red-500/30 bg-red-50/50 p-3 md:p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <span className="text-sm text-red-900 md:text-base">{error.message}</span>
                  {error.eventIndex !== undefined && (
                    <button
                      onClick={() => removeEvent(error.eventIndex!)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 md:text-sm"
                    >
                      Eliminar Evento
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-3 md:space-y-4">
          <h4 className="text-foreground flex items-center gap-3 text-lg font-semibold md:text-xl">
            <span className="text-xl md:text-2xl">📝</span>
            Asistencias
          </h4>
          <div className="space-y-3">
            {attendance.map((attendance) => (
              <div
                key={attendance.player_id}
                className={`rounded-xl border p-3 transition-all md:p-4 ${
                  attendance.source === "both"
                    ? "border-green-500/30 bg-green-50/50"
                    : attendance.source === "conflict"
                      ? "border-red-500/30 bg-red-50/50"
                      : "border-orange-500/30 bg-orange-50/50"
                }`}
              >
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div
                      className={`flex h-3 w-3 rounded-full ${
                        attendance.source === "both"
                          ? "bg-green-500"
                          : attendance.source === "conflict"
                            ? "bg-red-500"
                            : "bg-orange-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                        <span className="text-sm font-semibold md:text-base">
                          {attendance.first_name} {attendance.last_name}
                        </span>
                        <span className="text-muted-foreground text-xs md:text-sm">({attendance.team_name})</span>
                      </div>
                      {attendance.source === "both" && (
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              attendance.status === "present"
                                ? "bg-green-100 text-green-800"
                                : attendance.status === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {attendance.status}
                          </span>
                          {attendance.jersey_number ? (
                            <span className="ml-2 text-xs text-gray-600">#{attendance.jersey_number}</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {(attendance.source === "conflict" || attendance.source !== "both") && comparisonData ? (
                    <div className="ml-6 space-y-3">
                      <p className="text-sm font-medium text-gray-700">Selecciona qué datos usar:</p>

                      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                        <input
                          type="checkbox"
                          checked={selectedAttendanceChoices[attendance.player_id] === "planillero1"}
                          onChange={(e) =>
                            handleAttendanceChoiceChange(attendance.player_id, "planillero1", e.target.checked)
                          }
                          className="h-5 w-5 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-900">
                              📝 {comparisonData.planillero1.username}
                            </span>
                          </div>
                          {(() => {
                            const p1Data = comparisonData.planillero1.attendance.find(
                              (a: any) => a.player_id === attendance.player_id,
                            );
                            return p1Data ? (
                              <div className="mt-1 text-xs text-blue-700">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                  {p1Data.status}
                                </span>
                                {p1Data.jersey_number ? (
                                  <span className="ml-2 text-blue-600">#{p1Data.jersey_number}</span>
                                ) : null}
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-blue-700">Sin datos</div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50/50 p-3">
                        <input
                          type="checkbox"
                          checked={selectedAttendanceChoices[attendance.player_id] === "planillero2"}
                          onChange={(e) =>
                            handleAttendanceChoiceChange(attendance.player_id, "planillero2", e.target.checked)
                          }
                          className="h-5 w-5 text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-purple-900">
                              📝 {comparisonData.planillero2.username}
                            </span>
                          </div>
                          {(() => {
                            const p2Data = comparisonData.planillero2.attendance.find(
                              (a: any) => a.player_id === attendance.player_id,
                            );
                            return p2Data ? (
                              <div className="mt-1 text-xs text-purple-700">
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                                  {p2Data.status}
                                </span>
                                {p2Data.jersey_number ? (
                                  <span className="ml-2 text-purple-600">#{p2Data.jersey_number}</span>
                                ) : null}
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-purple-700">Sin datos</div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <h4 className="text-foreground flex items-center gap-3 text-lg font-semibold md:text-xl">
            <span className="text-xl md:text-2xl">⚽</span>
            Eventos
          </h4>
          <div className="space-y-3">
            {events.map((event, index) => {
              const hasPlayerError = validationErrors.some(
                (err) => err.type === "attendance_event_conflict" && err.eventIndex === index,
              );

              return (
                <div
                  key={index}
                  className={`rounded-xl border p-3 transition-all md:p-4 ${
                    hasPlayerError
                      ? "border-red-500/30 bg-red-50/50"
                      : event.source === "both"
                        ? "border-green-500/30 bg-green-50/50"
                        : "border-orange-500/30 bg-orange-50/50"
                  }`}
                >
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div
                        className={`flex h-3 w-3 rounded-full ${
                          hasPlayerError ? "bg-red-500" : event.source === "both" ? "bg-green-500" : "bg-orange-500"
                        }`}
                      />
                      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                        {editingEvent === index ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editMinute}
                              onChange={(e) => setEditMinute(parseInt(e.target.value))}
                              className="w-16 rounded-lg border border-gray-400 bg-white px-2 py-1 text-sm text-gray-900 md:w-20 md:px-3"
                              min="0"
                              max="120"
                            />
                            <button
                              onClick={saveMinuteEdit}
                              className="rounded-lg bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 md:px-3"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingEvent(null)}
                              className="rounded-lg bg-gray-500 px-2 py-1 text-xs text-white hover:bg-gray-600 md:px-3"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingMinute(index)}
                            className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 md:px-3"
                          >
                            {event.minute}&apos;
                          </button>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-lg md:text-xl">
                            {event.type === "goal"
                              ? "⚽"
                              : event.type === "yellow_card"
                                ? "🟨"
                                : event.type === "red_card"
                                  ? "🟥"
                                  : "📋"}
                          </span>
                          <span className="text-sm font-medium md:text-base">
                            {event.first_name} {event.last_name}
                          </span>
                          <span className="text-muted-foreground text-xs md:text-sm">({event.team_name})</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        {hasPlayerError ? (
                          <button
                            onClick={() => removeEvent(index)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {event.source !== "both" && comparisonData ? (
                      <div className="ml-6 space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          ⚠️ Evento solo reportado por un planillero. Selecciona si incluir:
                        </p>

                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                          <input
                            type="checkbox"
                            checked={selectedEventChoices[index] === "planillero1"}
                            onChange={(e) => handleEventChoiceChange(index, "planillero1", e.target.checked)}
                            className="h-5 w-5 text-blue-600"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-blue-900">
                              📝 Incluir según {comparisonData.planillero1.username}
                            </span>
                            <div className="mt-1 text-xs text-blue-700">
                              {comparisonData.planillero1.events.some(
                                (e: any) =>
                                  e.team_id === event.team_id &&
                                  e.player_id === event.player_id &&
                                  e.type === event.type &&
                                  e.minute === event.minute,
                              )
                                ? "✓ Reportado"
                                : "✗ No reportado"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50/50 p-3">
                          <input
                            type="checkbox"
                            checked={selectedEventChoices[index] === "planillero2"}
                            onChange={(e) => handleEventChoiceChange(index, "planillero2", e.target.checked)}
                            className="h-5 w-5 text-purple-600"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-purple-900">
                              📝 Incluir según {comparisonData.planillero2.username}
                            </span>
                            <div className="mt-1 text-xs text-purple-700">
                              {comparisonData.planillero2.events.some(
                                (e: any) =>
                                  e.team_id === event.team_id &&
                                  e.player_id === event.player_id &&
                                  e.type === event.type &&
                                  e.minute === event.minute,
                              )
                                ? "✓ Reportado"
                                : "✗ No reportado"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <label className="text-foreground block text-base font-semibold md:text-lg">
            Comentarios Administrativos {hasConflicts || hasErrors ? "(requeridos)" : "(opcional)"}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              hasConflicts || hasErrors
                ? "Explica cómo resolviste las diferencias o errores encontrados..."
                : "Agregar comentarios sobre la validación administrativa..."
            }
            className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border p-3 text-sm focus:ring-2 focus:outline-none md:p-4 md:text-base"
            rows={4}
            required={hasConflicts || hasErrors}
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={submitWithData}
            disabled={
              isPending || hasErrors || hasUnresolvedConflicts || ((hasConflicts || hasErrors) && !comments.trim())
            }
            className="from-primary to-accent w-full rounded-xl bg-gradient-to-r px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:px-8 md:py-4 md:text-lg"
          >
            {isPending
              ? "⏳ Procesando..."
              : hasUnresolvedConflicts
                ? "❌ Resuelve todas las diferencias"
                : "✅ Finalizar Partido"}
          </button>
        </div>

        {state.message ? (
          <div
            className={`rounded-xl border p-3 md:p-4 ${
              state.success
                ? "border-green-500/30 bg-green-50/50 text-green-900"
                : "border-red-500/30 bg-red-50/50 text-red-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg md:text-xl">{state.success ? "✅" : "❌"}</span>
              <span className="text-sm font-medium md:text-base">{state.message}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
