"use client";

import { useActionState, useState } from "react";

import { removePlayerFromTeam } from "@/actions/captain";
import type { Player } from "@/lib/types";

import ButtonSubmit from "../ui/ButtonSubmit";

import NicknameEditor from "./NicknameEditor";

interface PlayerManagementCardProps {
  player: Player & { profile_username?: string };
}

export default function PlayerManagementCard({ player }: PlayerManagementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [removeState, removeAction, removePending] = useActionState(removePlayerFromTeam, {
    success: 0,
    errors: 0,
    message: "",
    body: { player_id: player.id },
  });

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const getPositionLabel = (position: string) => {
    const positions = {
      GK: "Portero",
      DEF: "Defensa",
      MID: "Centrocampista",
      FWD: "Delantero",
    };
    return positions[position as keyof typeof positions] || position;
  };

  const getPositionColor = (position: string) => {
    const colors = {
      GK: "bg-purple-500/20 text-purple-400",
      DEF: "bg-blue-500/20 text-blue-400",
      MID: "bg-green-500/20 text-green-400",
      FWD: "bg-red-500/20 text-red-400",
    };
    return colors[position as keyof typeof colors] || "bg-ml-grey/20 text-ml-grey";
  };

  return (
    <div className="from-background-header to-background border-border-header hover:border-primary/30 relative overflow-hidden rounded-xl border-2 bg-gradient-to-br p-4 shadow-sm transition-all duration-500 hover:shadow-xl md:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="bg-primary/5 absolute bottom-0 left-0 h-20 w-20 -translate-x-10 translate-y-10 rounded-full" />
      {removeState.success === 1 && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="flex items-center gap-2 text-base font-medium text-green-400">
            <span className="text-lg">✅</span>
            {removeState.message}
          </p>
        </div>
      )}

      {removeState.errors === 1 && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="flex items-center gap-2 text-base font-medium text-red-400">
            <span className="text-lg">❌</span>
            {removeState.message}
          </p>
        </div>
      )}

      <div className="relative z-10 mb-6 flex flex-col gap-6 md:mb-8 md:gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 sm:flex-row md:gap-6 lg:justify-start">
          <div className="from-primary to-primary-darken flex h-16 w-16 min-w-[4rem] flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl font-bold text-black shadow-lg transition-transform duration-300 hover:scale-110 md:h-20 md:w-20 md:min-w-[5rem] md:rounded-2xl md:text-2xl">
            {player.jersey_number || "?"}
          </div>
          <div className="min-w-0 text-center sm:text-left lg:text-left">
            <h3 className="text-foreground mb-1 truncate text-xl leading-tight font-bold md:mb-2 md:text-2xl">
              {player.first_name} {player.last_name}
            </h3>
            {player.nickname ? (
              <p className="text-primary mb-1 truncate text-base font-semibold md:mb-2 md:text-lg">
                &quot;{player.nickname}&quot;
              </p>
            ) : null}
            <p className="text-ml-grey truncate text-base md:text-lg">@{player.profile_username}</p>
          </div>
        </div>

        <div className="flex-shrink-0 text-center lg:text-right">
          <span
            className={`rounded-lg border px-4 py-2 text-sm font-bold md:px-6 md:py-3 md:text-base ${getPositionColor(player.position)}`}
          >
            {getPositionLabel(player.position)}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4 md:mb-8 md:gap-6">
        <div className="from-background to-background/50 border-border-header hover:border-primary/30 rounded-lg border-2 bg-gradient-to-br p-4 text-center transition-all duration-300 md:p-6">
          <div className="bg-primary/10 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full md:mb-3 md:h-12 md:w-12">
            <span className="text-primary text-lg md:text-xl">🎂</span>
          </div>
          <p className="text-ml-grey mb-1 text-xs font-semibold tracking-wider uppercase md:mb-2">Edad</p>
          <p className="text-foreground text-lg font-bold md:text-xl">{calculateAge(player.birthday)} años</p>
        </div>
        <div className="from-background to-background/50 border-border-header hover:border-primary/30 rounded-lg border-2 bg-gradient-to-br p-4 text-center transition-all duration-300 md:p-6">
          <div className="bg-primary/10 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full md:mb-3 md:h-12 md:w-12">
            <span className="text-primary text-lg md:text-xl">⚽</span>
          </div>
          <p className="text-ml-grey mb-1 text-xs font-semibold tracking-wider uppercase md:mb-2">Posición</p>
          <p className="text-foreground text-sm leading-tight font-bold md:text-lg">
            {getPositionLabel(player.position)}
          </p>
        </div>
        <div className="from-background to-background/50 border-border-header hover:border-primary/30 rounded-lg border-2 bg-gradient-to-br p-4 text-center transition-all duration-300 md:p-6">
          <div className="bg-primary/10 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full md:mb-3 md:h-12 md:w-12">
            <span className="text-primary text-lg md:text-xl">🔢</span>
          </div>
          <p className="text-ml-grey mb-1 text-xs font-semibold tracking-wider uppercase md:mb-2">Número</p>
          <p className="text-foreground text-lg font-bold md:text-xl">{player.jersey_number || "N/A"}</p>
        </div>
      </div>

      {/* Expansion Indicator */}
      <div className="relative z-10 mb-4 flex justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 rounded-full border-2 bg-gradient-to-r px-4 py-2 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md md:px-6 md:py-3"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-primary text-sm font-semibold md:text-base">
              {isExpanded ? "Ocultar opciones" : "Gestionar jugador"}
            </span>
            <div className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
              <svg className="text-primary h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Collapsible Management Section */}
      {isExpanded ? (
        <div className="animate-in fade-in-0 slide-in-from-top-4 space-y-6 duration-300 md:space-y-8">
          <div>
            <NicknameEditor player={player} />
          </div>

          <div className="border-border-header relative z-10 flex flex-col gap-6 border-t-2 pt-6 md:gap-8 md:pt-8 lg:flex-row">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-block rounded-lg border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 px-4 py-3 md:px-6 md:py-4">
                <p className="mb-1 text-sm font-bold text-blue-400 md:text-base">📅 En el equipo desde</p>
                <p className="text-base font-semibold text-blue-300 md:text-lg">
                  {new Date(player.created_at || "").toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>

            <div className="lg:flex-shrink-0">
              <form
                action={(formData) => {
                  const confirmed = window.confirm(
                    `¿Estás seguro de que quieres remover a ${player.first_name} ${player.last_name} del equipo?`,
                  );
                  if (confirmed) {
                    removeAction(formData);
                  }
                }}
                className="flex"
              >
                <input type="hidden" name="player_id" value={player.id} />

                <ButtonSubmit
                  processing={
                    <span className="flex items-center gap-2">
                      <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">Removiendo...</span>
                    </span>
                  }
                  className="min-h-[48px] w-full rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-red-700 hover:to-red-800 hover:shadow-xl md:min-h-[56px] md:rounded-xl md:px-8 md:py-4 md:text-lg lg:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-base md:text-lg">🗑️</span>
                    <span className="truncate">Remover del Equipo</span>
                  </span>
                </ButtonSubmit>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
