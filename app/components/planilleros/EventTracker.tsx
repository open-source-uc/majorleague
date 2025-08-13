"use client";

import { useActionState, useEffect, useMemo, useState, useRef } from "react";

import { createEventWithPlayer } from "@/actions/planilleros";

interface EventTrackerProps {
  matchId: number;
  players: any[];
  initialEvents: any[];
}

export function EventTracker({ matchId, players, initialEvents }: EventTrackerProps) {
  const [state, formAction] = useActionState(createEventWithPlayer, {
    success: 0,
    errors: 0,
    message: "",
  });

  const [selectedPlayer, setSelectedPlayer] = useState<{id: string, name: string} | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

      <form 
        id="event-form" 
        action={(formData: FormData) => {
          if (!selectedPlayer?.id) {
            alert("Por favor selecciona un jugador antes de registrar el evento");
            return;
          }
          formAction(formData);
        }}
      >
        <input type="hidden" name="match_id" value={matchId} />

        <div className="bg-background-header border-border-header mb-6 rounded-lg border p-4">
          <label className="text-foreground mb-4 font-semibold flex items-center gap-2">
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
              className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary w-full sm:w-24 rounded-lg border-2 px-4 py-4 text-center text-xl font-bold focus:ring-2"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest('form');
                  const input = form?.querySelector('input[name="minute"]') as HTMLInputElement;
                  if (input) input.value = "45";
                }}
                className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 font-medium text-primary transition-colors hover:bg-primary/20 flex-1 sm:flex-none min-h-[48px]"
              >
                45' HT
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest('form');
                  const input = form?.querySelector('input[name="minute"]') as HTMLInputElement;
                  if (input) input.value = "90";
                }}
                className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 font-medium text-primary transition-colors hover:bg-primary/20 flex-1 sm:flex-none min-h-[48px]"
              >
                90' FT
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6" ref={dropdownRef}>
          <label className="text-foreground mb-4 font-semibold flex items-center gap-2">
            <span className="text-lg">👤</span>
            Seleccionar Jugador:
          </label>
          
          <input type="hidden" name="player_id" value={selectedPlayer?.id || ""} />
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-background border-border-header text-foreground focus:ring-primary focus:border-primary w-full rounded-lg border-2 p-4 text-base font-medium focus:ring-2 min-h-[56px] flex items-center justify-between touch-manipulation active:bg-background-header transition-colors"
            >
              <span className={selectedPlayer ? "text-foreground" : "text-foreground/60"}>
                {selectedPlayer 
                  ? `#${presentPlayers.find(p => p.id.toString() === selectedPlayer.id)?.jersey_number || "??"} — ${selectedPlayer.name}`
                  : "-- Seleccionar jugador --"
                }
              </span>
              <span className={`transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            
            {isDropdownOpen && presentPlayers.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border-border-header border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {presentPlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlayer({
                        id: player.id.toString(),
                        name: `${player.first_name} ${player.last_name}`
                      });
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left p-4 hover:bg-background-header active:bg-background-header transition-colors border-b border-border-header last:border-b-0 flex items-center gap-3 min-h-[60px] touch-manipulation"
                  >
                    <div className="bg-primary text-background rounded px-2 py-1 text-xs font-bold min-w-[32px] text-center flex-shrink-0">
                      #{player.jersey_number || "??"}
                    </div>
                    <span className="text-foreground font-medium leading-tight">
                      {player.first_name} {player.last_name}
                      {player.nickname && <span className="text-foreground/60 ml-1 block text-sm">"{player.nickname}"</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {presentPlayers.length === 0 && (
            <div className="mt-3 p-3 rounded-lg bg-background-header border border-border-header">
              <p className="text-sm text-foreground opacity-70 flex items-center gap-2">
                <span>⚠️</span>
                No hay jugadores presentes para registrar eventos
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="submit"
            name="event_type"
            value="goal"
            className="rounded-xl bg-primary hover:bg-primary-darken p-6 text-background shadow-lg transition-all active:scale-95 min-h-[80px] sm:min-h-[120px]"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-4xl sm:text-4xl">⚽</span>
              <span className="hidden sm:block text-lg sm:text-sm font-bold">GOL</span>
            </div>
          </button>
          <button
            type="submit"
            name="event_type"
            value="yellow_card"
            className="rounded-xl bg-foreground hover:bg-foreground/80 p-6 text-background shadow-lg transition-all active:scale-95 min-h-[80px] sm:min-h-[120px]"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-4xl sm:text-4xl">🟨</span>
              <span className="hidden sm:block text-lg sm:text-sm font-bold">AMARILLA</span>
            </div>
          </button>
          <button
            type="submit"
            name="event_type"
            value="red_card"
            className="rounded-xl bg-foreground/80 hover:bg-foreground/60 p-6 text-background shadow-lg transition-all active:scale-95 min-h-[80px] sm:min-h-[120px]"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-4xl sm:text-4xl">🟥</span>
              <span className="hidden sm:block text-lg sm:text-sm font-bold">ROJA</span>
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
                  event.type === "goal"
                    ? "border-primary bg-primary/5"
                    : "border-border-header bg-background"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="bg-foreground text-background rounded-lg px-3 py-2 font-mono font-bold min-w-[60px] text-center">
                    {event.minute}'
                  </span>
                  <span className="text-2xl">
                    {event.type === "goal" && "⚽"}
                    {event.type === "yellow_card" && "🟨"}
                    {event.type === "red_card" && "🟥"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground font-medium block truncate">{event.player_name}</span>
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
              <p className="font-medium mb-2">No hay eventos registrados</p>
              <p className="text-sm text-foreground/70">Los eventos aparecerán aquí una vez registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
