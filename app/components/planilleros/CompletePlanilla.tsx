"use client";

import { useActionState } from "react";

import { completePlanillero } from "@/actions/planilleros";

interface CompletePlanillaProps {
  matchId: number;
  planilleroStatus: string;
  matchStatus: string;
}

export function CompletePlanilla({ matchId, planilleroStatus, matchStatus }: CompletePlanillaProps) {
  const [state, formAction] = useActionState(completePlanillero, {
    success: 0,
    errors: 0,
    message: "",
  });

  const shouldShow = () => {
    // No mostrar si el partido está en admin review o finalizado
    if (matchStatus === "admin_review" || matchStatus === "finished") return false;

    // Durante partido en vivo: mostrar si no está completado
    if (matchStatus === "live") {
      return planilleroStatus !== "completed";
    }

    return false;
  };

  if (!shouldShow()) return null;

  return (
    <div className="bg-background-header border-border-header rounded-lg border p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <h3 className="text-foreground text-lg font-semibold">Completar Planilla</h3>
      </div>

      <div className="mb-4">
        <p className="text-foreground text-sm">
          Cuando termines de registrar la asistencia y eventos, envía los datos.
        </p>
      </div>

      {state.message ? (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 rounded-lg border p-4 ${state.success ? "border-primary bg-primary/5 text-foreground" : "border-border-header bg-background text-foreground"}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{state.success ? "✅" : "❌"}</span>
            <span className="font-medium">{state.message}</span>
          </div>
        </div>
      ) : null}

      <form action={formAction}>
        <input type="hidden" name="match_id" value={matchId} />
        <button
          type="submit"
          className="bg-primary/80 hover:bg-primary-darken min-h-[56px] w-full rounded-lg px-6 py-4 text-lg font-semibold text-white shadow-sm transition-colors"
        >
          <span className="mr-2">📋</span>
          Completar y Enviar Planilla
        </button>
      </form>
    </div>
  );
}
