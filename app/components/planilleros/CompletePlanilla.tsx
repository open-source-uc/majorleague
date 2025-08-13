"use client";

import { useActionState } from "react";

import { completePlanillero } from "@/actions/planilleros";

interface CompletePlanillaProps {
  matchId: number;
  planilleroStatus: string;
  matchStatus: string;
  myTeamValidation?: any;
}

export function CompletePlanilla({ matchId, planilleroStatus, matchStatus, myTeamValidation }: CompletePlanillaProps) {
  const [state, formAction] = useActionState(completePlanillero, {
    success: 0,
    errors: 0,
    message: "",
  });

  const shouldShow = () => {
    if (myTeamValidation?.status === "approved") return false;
    if (matchStatus === "live" && planilleroStatus !== "completed") return true;
    if (matchStatus === "in_review" && planilleroStatus === "assigned" && myTeamValidation?.status === "rejected") return true;
    return false;
  };

  if (!shouldShow()) return null;

  return (
    <div className="bg-background-header border-border-header rounded-lg border p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <h3 className="text-foreground text-lg font-semibold">Completar Planilla</h3>
      </div>

      <div className="mb-4 space-y-2">
        {myTeamValidation?.status === "rejected" ? (
          <>
            <p className="text-foreground text-sm">Tu planilla fue rechazada. Después de realizar las correcciones necesarias, puedes reenviarla para una nueva revisión.</p>
            <p className="text-foreground text-sm"><strong>Importante:</strong> Revisa los comentarios del revisor antes de reenviar.</p>
          </>
        ) : (
          <>
            <p className="text-foreground text-sm">Cuando termines de registrar los eventos de tu equipo, envía la planilla para revisión.</p>
            <p className="text-foreground text-sm"><strong>Importante:</strong> El partido pasará a revisión y podrás validar la planilla rival.</p>
          </>
        )}
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
          className="bg-primary hover:bg-primary-darken text-white w-full rounded-lg px-6 py-4 text-lg font-semibold shadow-sm transition-colors min-h-[56px]"
        >
          <span className="mr-2">📋</span>
          {myTeamValidation?.status === "rejected" ? "Reenviar Planilla Corregida" : "Enviar Planilla para Revisión"}
        </button>
      </form>
    </div>
  );
}
