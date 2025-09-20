"use client";

import { useActionState } from "react";

import { bulkUpdateMatchStatus, MatchWithData } from "@/actions/match-days";
import ButtonSubmit from "@/components/ui/ButtonSubmit";
import Form from "@/components/ui/Form";

interface BulkActionsProps {
  matches: MatchWithData[];
}

export default function BulkActions({ matches }: BulkActionsProps) {
  const [liveState, liveAction, livePending] = useActionState(bulkUpdateMatchStatus, {
    success: 0,
    errors: 0,
    message: "",
  });

  const [reviewState, reviewAction, reviewPending] = useActionState(bulkUpdateMatchStatus, {
    success: 0,
    errors: 0,
    message: "",
  });

  const [finishedState, finishedAction, finishedPending] = useActionState(bulkUpdateMatchStatus, {
    success: 0,
    errors: 0,
    message: "",
  });

  const matchIds = matches.map((m) => m.id);

  return (
    <div className="bg-card border-border mt-8 rounded-lg border p-6">
      <h3 className="text-foreground mb-4 text-lg font-medium">Acciones en Lote</h3>
      <div className="flex flex-wrap gap-3">
        <Form action={liveAction}>
          <input type="hidden" name="match_ids" value={JSON.stringify(matchIds)} />
          <input type="hidden" name="status" value="live" />
          <ButtonSubmit
            processing={"Procesando..."}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Marcar Todos como En Vivo
          </ButtonSubmit>
        </Form>

        <Form action={reviewAction}>
          <input type="hidden" name="match_ids" value={JSON.stringify(matchIds)} />
          <input type="hidden" name="status" value="admin_review" />
          <ButtonSubmit
            processing={"Procesando..."}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500/90"
          >
            Marcar Todos en Revisión
          </ButtonSubmit>
        </Form>

        <Form action={finishedAction}>
          <input type="hidden" name="match_ids" value={JSON.stringify(matchIds)} />
          <input type="hidden" name="status" value="finished" />
          <ButtonSubmit
            processing={"Procesando..."}
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500/90"
          >
            Marcar Todos como Terminados
          </ButtonSubmit>
        </Form>
      </div>

      {/* Status Messages */}
      {Boolean(liveState.message || reviewState.message || finishedState.message) && (
        <div className="mt-4 space-y-2">
          {Boolean(liveState.message) && (
            <div
              className={`rounded px-3 py-2 text-sm ${
                liveState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              }`}
            >
              {liveState.message}
            </div>
          )}
          {Boolean(reviewState.message) && (
            <div
              className={`rounded px-3 py-2 text-sm ${
                reviewState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              }`}
            >
              {reviewState.message}
            </div>
          )}
          {Boolean(finishedState.message) && (
            <div
              className={`rounded px-3 py-2 text-sm ${
                finishedState.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              }`}
            >
              {finishedState.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
