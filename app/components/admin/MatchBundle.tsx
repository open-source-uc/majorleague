"use client";

import { useState, useActionState } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import {
  CalendarDaysIcon,
  MapPinIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  UserGroupIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";

import { createEvent, updateEvent, deleteEvent } from "@/actions/events";
import { MatchWithData } from "@/actions/match-days";
import Button from "@/components/ui/Button";
import ButtonSubmit from "@/components/ui/ButtonSubmit";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface MatchBundleProps {
  match: MatchWithData;
  events?: any[];
  teamOptions: { value: string; label: string }[];
  playerOptions: { value: string; label: string }[];
}

const statusConfig = {
  scheduled: {
    label: "Programado",
    color: "bg-blue-500/10 text-blue-600",
    icon: CalendarDaysIcon,
  },
  live: {
    label: "En Vivo",
    color: "bg-red-500/10 text-red-600",
    icon: PlayIcon,
  },
  admin_review: {
    label: "Revisión",
    color: "bg-amber-500/10 text-amber-600",
    icon: PauseIcon,
  },
  finished: {
    label: "Terminado",
    color: "bg-green-500/10 text-green-600",
    icon: CheckCircleIcon,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-gray-500/10 text-gray-600",
    icon: XCircleIcon,
  },
};

const eventTypeConfig = {
  goal: { label: "Gol", icon: "⚽", color: "text-green-600" },
  yellow_card: { label: "Tarjeta Amarilla", icon: "🟨", color: "text-yellow-600" },
  red_card: { label: "Tarjeta Roja", icon: "🟥", color: "text-red-600" },
  substitution: { label: "Sustitución", icon: "🔄", color: "text-blue-600" },
  other: { label: "Otro", icon: "📝", color: "text-gray-600" },
};

export default function MatchBundle({ match, events = [], teamOptions, playerOptions }: MatchBundleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const [createState, createAction, createPending] = useActionState(
    (_: any, formData: FormData) => createEvent(_, formData),
    {
      success: 0,
      errors: 0,
      message: "",
      body: {
        match_id: 0,
        team_id: 0,
        type: "goal",
        minute: 0,
        description: undefined,
      },
    },
  );

  const [updateState, updateAction, updatePending] = useActionState(
    (_: any, formData: FormData) => updateEvent(_, formData),
    {
      success: 0,
      errors: 0,
      message: "",
      body: {
        id: 0,
        match_id: 0,
        team_id: 0,
        type: "goal",
        minute: 0,
        description: undefined,
      },
    },
  );

  const [deleteState, deleteAction, deletePending] = useActionState(
    (_: any, formData: FormData) => deleteEvent(_, formData),
    {
      success: 0,
      errors: 0,
      message: "",
      body: {
        id: 0,
      },
    },
  );

  const StatusIcon = statusConfig[match.status as keyof typeof statusConfig]?.icon || CalendarDaysIcon;
  const statusStyle = statusConfig[match.status as keyof typeof statusConfig]?.color || "bg-gray-500/10 text-gray-600";
  const statusLabel = statusConfig[match.status as keyof typeof statusConfig]?.label || match.status;

  const matchEvents = events.filter((e) => e.match_id === match.id);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const handleEventSubmit = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      const formData = new FormData();
      formData.append("id", eventId.toString());
      deleteAction(formData);
    }
  };

  return (
    <div className="border-border bg-card rounded-lg border p-6 transition-all hover:shadow-md">
      {/* Match Header */}
      <div className="flex cursor-pointer items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-4">
          {/* Match Info */}
          <div className="flex items-center space-x-3">
            <div className="min-w-[100px] text-center">
              <div className="text-foreground text-sm font-medium">{match.local_team_name}</div>
              <div className="text-muted-foreground text-xs">Local</div>
            </div>

            <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-center">
              <div className="text-lg font-bold">
                {match.local_score} - {match.visitor_score}
              </div>
              <div className="text-xs">{formatTime(match.timestamp)}</div>
            </div>

            <div className="min-w-[100px] text-center">
              <div className="text-foreground text-sm font-medium">{match.visitor_team_name}</div>
              <div className="text-muted-foreground text-xs">Visitante</div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusLabel}
          </div>

          {/* Stats */}
          <div className="text-muted-foreground flex space-x-4 text-xs">
            <div className="flex items-center">
              <BoltIcon className="mr-1 h-3 w-3" />
              {match.events_count} eventos
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="mr-1 h-3 w-3" />
              {match.lineup_count} lineups
            </div>
            {Boolean(match.stream_url) && (
              <div className="flex items-center">
                <PlayIcon className="mr-1 h-3 w-3" />
                Stream
              </div>
            )}
          </div>
        </div>

        {/* Expand Button */}
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </div>
      </div>

      {/* Match Details */}
      {Boolean(match.location) && (
        <div className="text-muted-foreground mt-2 flex items-center text-xs">
          <MapPinIcon className="mr-1 h-3 w-3" />
          {match.location}
        </div>
      )}

      {/* Expanded Content */}
      {Boolean(isExpanded) && (
        <div className="mt-6 space-y-6">
          {/* Events Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-foreground flex items-center text-sm font-medium">
                <BoltIcon className="mr-2 h-4 w-4" />
                Eventos del Partido ({matchEvents.length})
              </h3>
              <Button onClick={() => setShowEventForm(!showEventForm)} size="sm" variant="outline">
                {showEventForm ? "Cancelar" : "Agregar Evento"}
              </Button>
            </div>

            {/* Event Form */}
            {Boolean(showEventForm) && (
              <div className="bg-muted mb-4 rounded-lg p-4">
                <Form action={editingEvent ? updateAction : createAction}>
                  {Boolean(editingEvent) && <input type="hidden" name="id" value={editingEvent.id} />}
                  <input type="hidden" name="match_id" value={match.id} />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Select
                      name="team_id"
                      label="Equipo"
                      options={teamOptions.filter(
                        (t) =>
                          t.value === match.local_team_id.toString() || t.value === match.visitor_team_id.toString(),
                      )}
                      defaultValue={editingEvent?.team_id?.toString()}
                      required
                    />

                    <Select
                      name="type"
                      label="Tipo de Evento"
                      options={Object.entries(eventTypeConfig).map(([key, config]) => ({
                        value: key,
                        label: `${config.icon} ${config.label}`,
                      }))}
                      defaultValue={editingEvent?.type}
                      required
                    />

                    <Input
                      name="minute"
                      type="number"
                      label="Minuto"
                      min="0"
                      max="120"
                      defaultValue={editingEvent?.minute?.toString()}
                      required
                    />

                    <Input
                      name="description"
                      label="Descripción"
                      placeholder="Opcional"
                      defaultValue={editingEvent?.description}
                    />
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <ButtonSubmit processing={"Guardando..."} className="h-8 rounded-xs px-3 text-sm">
                      {editingEvent ? "Actualizar" : "Crear"} Evento
                    </ButtonSubmit>

                    {Boolean(editingEvent) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingEvent(null);
                          setShowEventForm(false);
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            )}

            {/* Events List */}
            <div className="space-y-2">
              {matchEvents.length === 0 ? (
                <div className="text-muted-foreground bg-muted/50 rounded-lg p-4 text-center text-sm">
                  No hay eventos registrados para este partido
                </div>
              ) : (
                matchEvents.map((event) => {
                  const eventConfig = eventTypeConfig[event.type as keyof typeof eventTypeConfig];
                  return (
                    <div
                      key={event.id}
                      className="bg-background border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-muted-foreground bg-muted rounded-full px-2 py-1 font-mono text-xs">
                          {event.minute}&rsquo;
                        </div>
                        <div className={`text-lg ${eventConfig?.color || "text-gray-600"}`}>
                          {eventConfig?.icon || "📝"}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{eventConfig?.label || event.type}</div>
                          {Boolean(event.description) && (
                            <div className="text-muted-foreground text-xs">{event.description}</div>
                          )}
                          {Boolean(event.player_name) && (
                            <div className="text-muted-foreground text-xs">{event.player_name}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEventForm(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-border border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <TrophyIcon className="mr-1 h-3 w-3" />
                Ver Lineups
              </Button>
              {Boolean(match.stream_id) && (
                <Button size="sm" variant="outline">
                  <PlayIcon className="mr-1 h-3 w-3" />
                  Gestionar Stream
                </Button>
              )}
              <Button size="sm" variant="outline">
                <UserGroupIcon className="mr-1 h-3 w-3" />
                Asignar Planilleros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
