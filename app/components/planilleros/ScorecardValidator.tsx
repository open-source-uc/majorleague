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

export function ScorecardValidator({
  matchId,
  rivalTeam,
  currentValidation,
}: ScorecardValidatorProps) {
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
        <h4 className="text-foreground mb-4 font-medium flex items-center gap-2">
          <span className="text-lg">📊</span>
          Eventos Registrados:
        </h4>
        <div className="space-y-3">
          {rivalTeam.events
            .sort((a, b) => a.minute - b.minute)
            .map((event) => (
              <div key={event.id} className="bg-background border-border-header rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <span className="bg-foreground text-background rounded-lg px-3 py-2 font-mono font-bold min-w-[60px] text-center">
                    {event.minute}&apos;
                  </span>
                  <span className="text-2xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground font-medium block">{getEventLabel(event.type)}</span>
                    {event.player_name && (
                      <div className="text-sm text-foreground/70 truncate">{event.player_name}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {rivalTeam.events.length === 0 && (
            <div className="text-foreground py-8 text-center">
              <span className="mb-3 block text-4xl">📝</span>
              <p className="font-medium mb-2">No hay eventos registrados</p>
              <p className="text-sm text-foreground/70">El equipo rival no ha registrado eventos</p>
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
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">
              {currentValidation.status === "approved" ? "✅" : 
               currentValidation.status === "rejected" ? "❌" : "⏳"}
            </span>
            <span className="font-medium">
              Estado: {currentValidation.status === "approved" ? "Aprobado" : 
                      currentValidation.status === "rejected" ? "Rechazado" : "Pendiente"}
            </span>
          </div>
          {currentValidation.comments && (
            <div className="mt-3 p-3 bg-background rounded border border-border-header">
              <p className="text-sm font-medium mb-1">Comentarios:</p>
              <p className="text-sm">{currentValidation.comments}</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Formulario de validación optimizado para móvil */}
      {!isAlreadyValidated && (
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="match_id" value={matchId} />
          <input type="hidden" name="validated_team_id" value={rivalTeam.id} />

          <div>
            <label className="text-foreground mb-3 font-medium flex items-center gap-2">
              <span className="text-lg">💬</span>
              Comentarios (opcional):
            </label>
            <textarea
              name="comments"
              rows={4}
              className="bg-background border-border-header text-foreground w-full rounded-lg border-2 p-4 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              placeholder="Agregar comentarios sobre la planilla..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="submit"
              name="status"
              value="approved"
              className="bg-primary hover:bg-primary-darken text-white rounded-lg px-6 py-4 font-medium transition-colors shadow-sm min-h-[56px] flex items-center justify-center gap-3"
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
              className="bg-foreground/80 hover:bg-foreground/60 text-background rounded-lg px-6 py-4 font-medium transition-colors shadow-sm min-h-[56px] flex items-center justify-center gap-3"
            >
              <span className="text-xl">❌</span>
              <span>Solicitar Corrección</span>
            </button>
          </div>

          {state.message ? (
            <div className={`rounded-lg border p-4 ${state.success ? "border-primary bg-primary/5 text-primary" : "border-border-header bg-background text-foreground"}`}>
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
