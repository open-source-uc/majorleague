"use client";

import { useActionState, useEffect, useMemo, useState, useRef } from "react";

import { createDraftEventWithPlayer } from "@/actions/planilleros";

interface EventTrackerProps {
  matchId: number;
  players: any[];
  initialEvents: any[];
  teamId?: number; // Add optional teamId to make forms unique
}

export function EventTracker({ matchId, players, initialEvents, teamId }: EventTrackerProps) {
  const [state, formAction] = useActionState(createDraftEventWithPlayer, {
    success: 0,
    errors: 0,
    message: "",
  });

  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const defaultMinute = useMemo(() => {
    if (!initialEvents || initialEvents.length === 0) return 1;
    const maxMinute = Math.max(...initialEvents.map((e: any) => e.minute || 0));
    return Math.min(maxMinute + 1, 120) || 1;
  }, [initialEvents]);

  useEffect(() => {
    if (state.success) {
      setSelectedPlayer(null);
      setIsDropdownOpen(false);
    }
  }, [state.success]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presentPlayers = useMemo(() => {
    return players
      .filter((p) => p.attendance_status === "present")
      .sort((a, b) => (a.jersey_number || 999) - (b.jersey_number || 999));
  }, [players]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚽</span>
        <h3 className="text-foreground text-lg font-semibold">Eventos</h3>
      </div>

      <form ref={formRef} id={`event-form-${teamId || "default"}`} action={formAction}>
        <input type="hidden" name="match_id" value={matchId} />
        <input type="hidden" name="event_type" value="" />

        <div className="bg-background-header border-border-header mb-6 rounded-lg border p-4">
          <label className="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <span className="text-lg">⏱️</span>
            Minuto del evento:
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <input
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              name="minute"
              min="1"
              max="120"
              defaultValue={defaultMinute}
              className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary w-full rounded-lg border-2 px-4 py-4 text-center text-xl font-bold focus:ring-2 sm:w-24"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest("form");
                  const input = form?.querySelector('input[name="minute"]') as HTMLInputElement;
                  if (input) input.value = "45";
                }}
                className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 min-h-[48px] flex-1 rounded-lg border px-4 py-3 font-medium transition-colors sm:flex-none"
              >
                45&apos; HT
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest("form");
                  const input = form?.querySelector('input[name="minute"]') as HTMLInputElement;
                  if (input) input.value = "90";
                }}
                className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 min-h-[48px] flex-1 rounded-lg border px-4 py-3 font-medium transition-colors sm:flex-none"
              >
                90&apos; FT
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6" ref={dropdownRef}>
          <label className="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <span className="text-lg">👤</span>
            Seleccionar Jugador:
          </label>

          <input type="hidden" name="player_id" value={selectedPlayer?.id || ""} />

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary active:bg-background-header flex min-h-[56px] w-full touch-manipulation items-center justify-between rounded-lg border-2 p-4 text-base font-medium transition-colors focus:ring-2"
            >
              <span className={selectedPlayer ? "text-foreground" : "text-foreground/60"}>
                {selectedPlayer
                  ? `#${presentPlayers.find((p) => p.id.toString() === selectedPlayer.id)?.jersey_number || "??"} — ${selectedPlayer.name}`
                  : "-- Seleccionar jugador --"}
              </span>
              <span className={`transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {isDropdownOpen && presentPlayers.length > 0 ? (
              <div className="bg-background border-border-header absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border-2 shadow-lg">
                {presentPlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlayer({
                        id: player.id.toString(),
                        name: `${player.first_name} ${player.last_name}`,
                      });
                      setIsDropdownOpen(false);
                    }}
                    className="hover:bg-background-header active:bg-background-header border-border-header flex min-h-[60px] w-full touch-manipulation items-center gap-3 border-b p-4 text-left transition-colors last:border-b-0"
                  >
                    <div className="bg-primary text-background min-w-[32px] flex-shrink-0 rounded px-2 py-1 text-center text-xs font-bold">
                      #{player.jersey_number || "??"}
                    </div>
                    <span className="text-foreground leading-tight font-medium">
                      {player.first_name} {player.last_name}
                      {player.nickname ? (
                        <span className="text-foreground/60 ml-1 block text-sm">&quot;{player.nickname}&quot;</span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {presentPlayers.length === 0 && (
            <div className="bg-background-header border-border-header mt-3 rounded-lg border p-3">
              <p className="text-foreground flex items-center gap-2 text-sm opacity-70">
                <span>⚠️</span>
                No hay jugadores presentes para registrar eventos
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={(e) => {
              if (!selectedPlayer?.id) {
                alert("Por favor selecciona un jugador antes de registrar el evento");
                return;
              }
              const form = formRef.current;
              if (form) {
                const eventTypeInput = form.querySelector('input[name="event_type"]') as HTMLInputElement;
                if (eventTypeInput) {
                  eventTypeInput.value = "goal";
                  form.requestSubmit();
                }
              }
            }}
            className="bg-primary hover:bg-primary-darken text-background min-h-[80px] rounded-xl p-6 shadow-lg transition-all active:scale-95 sm:min-h-[120px]"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-4xl sm:text-4xl">⚽</span>
              <span className="hidden text-lg font-bold sm:block sm:text-sm">GOL</span>
            </div>
          </button>
          <button
            type="button"
            onClick={(e) => {
              if (!selectedPlayer?.id) {
                alert("Por favor selecciona un jugador antes de registrar el evento");
                return;
              }
              const form = formRef.current;
              if (form) {
                const eventTypeInput = form.querySelector('input[name="event_type"]') as HTMLInputElement;
                if (eventTypeInput) {
                  eventTypeInput.value = "yellow_card";
                  form.requestSubmit();
                }
              }
            }}
            className="bg-foreground hover:bg-foreground/80 text-background min-h-[80px] rounded-xl p-6 shadow-lg transition-all active:scale-95 sm:min-h-[120px]"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-4xl sm:text-4xl">🟨</span>
              <span className="hidden text-lg font-bold sm:block sm:text-sm">AMARILLA</span>
            </div>
          </button>
          <button
            type="button"
            onClick={(e) => {
              if (!selectedPlayer?.id) {
                alert("Por favor selecciona un jugador antes de registrar el evento");
                return;
              }
              const form = formRef.current;
              if (form) {
                const eventTypeInput = form.querySelector('input[name="event_type"]') as HTMLInputElement;
                if (eventTypeInput) {
                  eventTypeInput.value = "red_card";
                  form.requestSubmit();
                }
              }
            }}
            className="bg-foreground/80 hover:bg-foreground/60 text-background min-h-[80px] rounded-xl p-6 shadow-lg transition-all active:scale-95 sm:min-h-[120px]"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-4xl sm:text-4xl">🟥</span>
              <span className="hidden text-lg font-bold sm:block sm:text-sm">ROJA</span>
            </div>
          </button>
        </div>

        {state.message ? (
          <div
            className={`mt-4 rounded-lg border p-4 ${state.success ? "border-primary bg-primary/5 text-primary" : "border-border-header bg-background text-foreground"}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{state.success ? "✅" : "❌"}</span>
              <span className="font-medium">{state.message}</span>
            </div>
          </div>
        ) : null}
      </form>

      <div className="bg-background-header border-border-header rounded-lg border p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xl">📊</span>
          <h4 className="text-foreground font-semibold">Eventos Registrados</h4>
        </div>
        <div className="space-y-3">
          {initialEvents
            .sort((a, b) => b.minute - a.minute)
            .map((event) => (
              <div
                key={event.id}
                className={`rounded-lg border-2 p-4 transition-all ${
                  event.type === "goal" ? "border-primary bg-primary/5" : "border-border-header bg-background"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="bg-foreground text-background min-w-[60px] rounded-lg px-3 py-2 text-center font-mono font-bold">
                    {event.minute}&apos;
                  </span>
                  <span className="text-2xl">
                    {event.type === "goal" && "⚽"}
                    {event.type === "yellow_card" && "🟨"}
                    {event.type === "red_card" && "🟥"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-foreground block truncate font-medium">{event.player_name}</span>
                    <span className="text-foreground/60 text-sm capitalize">
                      {event.type === "goal" && "Gol"}
                      {event.type === "yellow_card" && "Tarjeta Amarilla"}
                      {event.type === "red_card" && "Tarjeta Roja"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

          {initialEvents.length === 0 && (
            <div className="text-foreground py-8 text-center">
              <span className="mb-3 block text-4xl">📝</span>
              <p className="mb-2 font-medium">No hay eventos registrados</p>
              <p className="text-foreground/70 text-sm">Los eventos aparecerán aquí una vez registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
