"use client";

import { useActionState } from "react";

import { validateScorecard } from "@/actions/planilleros";

interface ScorecardValidatorProps {
  matchId: number;
  rivalTeam: {
    id: number;
    name: string;
    events: any[];
  };
  currentValidation?: any;
}

export function ScorecardValidator({ matchId, rivalTeam, currentValidation }: ScorecardValidatorProps) {
  const [state, formAction] = useActionState(validateScorecard, {
    success: 0,
    errors: 0,
    message: "",
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal":
        return "⚽";
      case "yellow_card":
        return "🟨";
      case "red_card":
        return "🟥";
      default:
        return "📝";
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "goal":
        return "Gol";
      case "yellow_card":
        return "Tarjeta Amarilla";
      case "red_card":
        return "Tarjeta Roja";
      default:
        return type;
    }
  };

  const isAlreadyValidated = currentValidation?.status !== "pending";

  return (
    <div className="space-y-4">
      {/* Header optimizado para móvil */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔍</span>
        <h3 className="text-foreground text-lg font-semibold">Validar: {rivalTeam.name}</h3>
      </div>

      {/* Vista de eventos del equipo rival optimizada para móvil */}
      <div className="bg-background-header border-border-header rounded-lg border p-4">
        <h4 className="text-foreground mb-4 flex items-center gap-2 font-medium">
          <span className="text-lg">📊</span>
          Eventos Registrados:
        </h4>
        <div className="space-y-3">
          {rivalTeam.events
            .sort((a, b) => a.minute - b.minute)
            .map((event) => (
              <div key={event.id} className="bg-background border-border-header rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <span className="bg-foreground text-background min-w-[60px] rounded-lg px-3 py-2 text-center font-mono font-bold">
                    {event.minute}&apos;
                  </span>
                  <span className="text-2xl">{getEventIcon(event.type)}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-foreground block font-medium">{getEventLabel(event.type)}</span>
                    {event.player_name ? (
                      <div className="text-foreground/70 truncate text-sm">{event.player_name}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

          {rivalTeam.events.length === 0 && (
            <div className="text-foreground py-8 text-center">
              <span className="mb-3 block text-4xl">📝</span>
              <p className="mb-2 font-medium">No hay eventos registrados</p>
              <p className="text-foreground/70 text-sm">El equipo rival no ha registrado eventos</p>
            </div>
          )}
        </div>
      </div>

      {/* Estado actual de validación */}
      {currentValidation ? (
        <div
          className={`rounded-lg border p-4 ${
            currentValidation.status === "approved"
              ? "border-primary bg-primary/5 text-primary"
              : currentValidation.status === "rejected"
                ? "border-border-header bg-background text-foreground"
                : "border-border-header bg-background-header text-foreground"
          }`}
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xl">
              {currentValidation.status === "approved" ? "✅" : currentValidation.status === "rejected" ? "❌" : "⏳"}
            </span>
            <span className="font-medium">
              Estado:{" "}
              {currentValidation.status === "approved"
                ? "Aprobado"
                : currentValidation.status === "rejected"
                  ? "Rechazado"
                  : "Pendiente"}
            </span>
          </div>
          {currentValidation.comments ? (
            <div className="bg-background border-border-header mt-3 rounded border p-3">
              <p className="mb-1 text-sm font-medium">Comentarios:</p>
              <p className="text-sm">{currentValidation.comments}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Formulario de validación optimizado para móvil */}
      {!isAlreadyValidated && (
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="match_id" value={matchId} />
          <input type="hidden" name="validated_team_id" value={rivalTeam.id} />

          <div>
            <label className="text-foreground mb-3 flex items-center gap-2 font-medium">
              <span className="text-lg">💬</span>
              Comentarios (opcional):
            </label>
            <textarea
              name="comments"
              rows={4}
              className="bg-background border-border-header text-foreground focus:border-primary focus:ring-primary w-full resize-none rounded-lg border-2 p-4 focus:ring-1"
              placeholder="Agregar comentarios sobre la planilla..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="submit"
              name="status"
              value="approved"
              className="bg-primary/80 hover:bg-primary-darken flex min-h-[56px] items-center justify-center gap-3 rounded-lg px-6 py-4 font-medium text-white shadow-sm transition-colors"
            >
              <span className="text-xl">✅</span>
              <span>Aprobar Planilla</span>
            </button>
            <button
              type="submit"
              name="status"
              value="rejected"
              onClick={(e) => {
                const ok = window.confirm("¿Seguro que deseas solicitar corrección?");
                if (!ok) e.preventDefault();
              }}
              className="bg-foreground/80 hover:bg-foreground/60 text-background flex min-h-[56px] items-center justify-center gap-3 rounded-lg px-6 py-4 font-medium shadow-sm transition-colors"
            >
              <span className="text-xl">❌</span>
              <span>Solicitar Corrección</span>
            </button>
          </div>

          {state.message ? (
            <div
              className={`rounded-lg border p-4 ${state.success ? "border-primary bg-primary/5 text-primary" : "border-border-header bg-background text-foreground"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{state.success ? "✅" : "❌"}</span>
                <span className="font-medium">{state.message}</span>
              </div>
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}
