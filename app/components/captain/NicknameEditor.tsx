"use client";

import { useActionState, useState } from "react";

import { updatePlayerNickname } from "@/actions/captain";
import type { Player } from "@/lib/types";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";

interface NicknameEditorProps {
  player: Player;
}

export default function NicknameEditor({ player }: NicknameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, action, pending] = useActionState(updatePlayerNickname, {
    success: 0,
    errors: 0,
    message: "",
    body: { player_id: player.id, nickname: player.nickname || undefined },
  });

  const handleSuccess = () => {
    if (state.success === 1) {
      setIsEditing(false);
    }
  };

  if (state.success === 1) {
    setTimeout(handleSuccess, 2000);
  }

  if (!isEditing) {
    return (
      <div className="bg-background border-border-header flex items-center justify-between gap-3 rounded-lg border p-3 md:p-4">
        <div className="min-w-0 flex-1">
          <p className="text-ml-grey mb-1 text-xs font-medium tracking-wider uppercase">Apodo</p>
          <p className="text-foreground truncate text-sm font-medium md:text-base">
            {player.nickname ? `"${player.nickname}"` : "Sin apodo"}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-primary hover:text-primary-darken hover:bg-primary/10 flex-shrink-0 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200 md:px-3 md:py-2 md:text-sm"
        >
          <span className="md:hidden">✏️</span>
          <span className="hidden md:inline">✏️ Editar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 md:p-4">
      {state.success === 1 && (
        <div className="mb-3 rounded-lg border border-green-500/30 bg-green-500/10 p-2 md:mb-4 md:p-3">
          <p className="flex items-center gap-2 text-xs font-medium text-green-400 md:text-sm">
            <span>✅</span>
            <span className="truncate">{state.message}</span>
          </p>
        </div>
      )}

      {state.errors === 1 && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2 md:mb-4 md:p-3">
          <p className="flex items-center gap-2 text-xs font-medium text-red-400 md:text-sm">
            <span>❌</span>
            <span className="truncate">{state.message}</span>
          </p>
        </div>
      )}

      <Form action={action}>
        <input type="hidden" name="player_id" value={player.id} />

        <div className="mb-3 md:mb-4">
          <Input
            name="nickname"
            label="Apodo del Jugador"
            type="text"
            placeholder="Ej: El Tigre, Pibe, etc."
            defaultValue={player.nickname || ""}
            maxLength={50}
          />
          <p className="text-ml-grey mt-1 text-xs">Deja vacío para eliminar el apodo</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row md:gap-3">
          <ButtonSubmit
            processing={
              <span className="flex items-center gap-1 md:gap-2">
                <div className="border-background h-3 w-3 animate-spin rounded-full border-2 border-t-transparent md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Guardando...</span>
              </span>
            }
            className="flex-1 bg-blue-600 px-3 py-2 text-xs font-medium hover:bg-blue-700 sm:flex-none md:px-4 md:text-sm"
          >
            <span className="flex items-center justify-center gap-1 md:gap-2">
              <span>💾</span>
              <span>Guardar</span>
            </span>
          </ButtonSubmit>

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="border-border-header text-ml-grey hover:text-foreground hover:border-primary/50 flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 sm:flex-none md:px-4 md:text-sm"
          >
            Cancelar
          </button>
        </div>
      </Form>
    </div>
  );
}
