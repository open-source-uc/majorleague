"use client";

import { useActionState, useState } from "react";

import { approveJoinRequest, rejectJoinRequest } from "@/actions/captain";
import type { JoinTeamRequest } from "@/lib/types";

import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";

interface JoinRequestCardProps {
  request: JoinTeamRequest & { profile_username?: string };
}

export default function JoinRequestCard({ request }: JoinRequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [approveState, approveAction, approvePending] = useActionState(approveJoinRequest, {
    success: 0,
    errors: 0,
    message: "",
    body: { request_id: request.id, jersey_number: undefined },
  });

  const [rejectState, rejectAction, rejectPending] = useActionState(rejectJoinRequest, {
    success: 0,
    errors: 0,
    message: "",
    body: { request_id: request.id, rejection_reason: undefined },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  return (
    <div className="from-background-header to-background border-border-header hover:border-primary/30 relative overflow-hidden rounded-xl border-2 bg-gradient-to-br p-4 shadow-sm transition-all duration-500 hover:shadow-xl md:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="bg-primary/5 absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full" />
      {(approveState.success === 1 || rejectState.success === 1) && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="flex items-center gap-2 text-base font-medium text-green-400">
            <span className="text-lg">✅</span>
            {approveState.message || rejectState.message}
          </p>
        </div>
      )}

      {(approveState.errors === 1 || rejectState.errors === 1) && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="flex items-center gap-2 text-base font-medium text-red-400">
            <span className="text-lg">❌</span>
            {approveState.message || rejectState.message}
          </p>
        </div>
      )}

      <div className="relative z-10 mb-8">
        <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 text-center lg:text-left">
            <div className="mb-3 flex flex-col justify-center gap-3 sm:flex-row sm:items-center md:gap-4 lg:justify-start">
              <div className="bg-primary/20 mx-auto flex-shrink-0 rounded-full p-2 sm:mx-0 md:p-3">
                <span className="text-primary text-xl md:text-2xl">👤</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-foreground mb-1 truncate text-xl font-bold md:text-2xl">
                  {request.first_name} {request.last_name}
                </h3>
                {request.nickname ? (
                  <p className="text-primary truncate text-base font-semibold md:text-lg">
                    &quot;{request.nickname}&quot;
                  </p>
                ) : null}
              </div>
            </div>
            <p className="text-ml-grey truncate text-base md:text-lg">@{request.profile_username}</p>
          </div>

          <div className="flex-shrink-0 text-center lg:text-right">
            <div className="inline-block rounded-lg border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 px-4 py-3 md:px-6 md:py-4">
              <p className="mb-1 text-sm font-bold text-blue-400 md:text-base">📅 Solicitud enviada</p>
              <p className="text-xs text-blue-300 md:text-sm">{formatDate(request.created_at || "")}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          <div className="from-background to-background/50 border-border-header hover:border-primary/30 rounded-lg border-2 bg-gradient-to-br p-4 text-center transition-all duration-300 md:p-6">
            <div className="bg-primary/10 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full md:mb-3 md:h-12 md:w-12">
              <span className="text-primary text-lg md:text-xl">🎂</span>
            </div>
            <p className="text-ml-grey mb-1 text-xs font-semibold tracking-wider uppercase md:mb-2">Edad</p>
            <p className="text-foreground text-lg font-bold md:text-xl">{calculateAge(request.birthday)} años</p>
          </div>
          <div className="from-background to-background/50 border-border-header hover:border-primary/30 rounded-lg border-2 bg-gradient-to-br p-4 text-center transition-all duration-300 md:p-6">
            <div className="bg-primary/10 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full md:mb-3 md:h-12 md:w-12">
              <span className="text-primary text-lg md:text-xl">⚽</span>
            </div>
            <p className="text-ml-grey mb-1 text-xs font-semibold tracking-wider uppercase md:mb-2">Posición</p>
            <p className="text-foreground text-sm leading-tight font-bold md:text-lg">
              {getPositionLabel(request.preferred_position || "")}
            </p>
          </div>
          <div className="from-background to-background/50 border-border-header hover:border-primary/30 rounded-lg border-2 bg-gradient-to-br p-4 text-center transition-all duration-300 md:p-6">
            <div className="bg-primary/10 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full md:mb-3 md:h-12 md:w-12">
              <span className="text-primary text-lg md:text-xl">🔢</span>
            </div>
            <p className="text-ml-grey mb-1 text-xs leading-tight font-semibold tracking-wider uppercase md:mb-2">
              Número Preferido
            </p>
            <p className="text-foreground text-lg font-bold md:text-xl">
              {request.preferred_jersey_number || "Sin pref."}
            </p>
          </div>
          <div className="from-background to-background/50 border-border-header rounded-lg border-2 bg-gradient-to-br p-4 text-center md:p-6">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 md:mb-3 md:h-12 md:w-12">
              <span className="text-lg text-yellow-400 md:text-xl">⏳</span>
            </div>
            <p className="text-ml-grey mb-1 text-xs font-semibold tracking-wider uppercase md:mb-2">Estado</p>
            <span className="rounded-full border border-yellow-500/40 bg-yellow-500/30 px-3 py-1.5 text-xs font-bold text-yellow-400 md:text-sm">
              PENDIENTE
            </span>
          </div>
        </div>

        {request.notes ? (
          <div className="bg-background border-border-header rounded-lg border p-4 md:p-6">
            <p className="text-ml-grey mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase md:mb-3 md:text-sm">
              💬 Comentarios del Solicitante
            </p>
            <p className="text-foreground text-sm leading-relaxed md:text-base">{request.notes}</p>
          </div>
        ) : null}
      </div>

      {/* Expansion Indicator */}
      <div className="relative z-10 mb-4 flex justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 rounded-full border-2 bg-gradient-to-r px-4 py-2 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md md:px-6 md:py-3"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-primary text-sm font-semibold md:text-base">
              {isExpanded ? "Ocultar opciones" : "Gestionar solicitud"}
            </span>
            <div className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
              <svg className="text-primary h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Collapsible Actions Section */}
      {isExpanded ? (
        <div className="animate-in fade-in-0 slide-in-from-top-4 relative z-10 grid grid-cols-1 gap-6 duration-300 md:gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 md:p-6">
            <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-green-400 md:mb-4 md:text-lg">
              ✅ Aprobar Solicitud
            </h4>
            <Form action={approveAction}>
              <input type="hidden" name="request_id" value={request.id} />

              <div className="mb-4 md:mb-6">
                <Input
                  name="jersey_number"
                  label="Número de Camiseta (Opcional)"
                  type="number"
                  min={1}
                  max={99}
                  placeholder={request.preferred_jersey_number?.toString() || ""}
                />
              </div>

              <ButtonSubmit
                processing={
                  <span className="flex items-center gap-2">
                    <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent md:h-5 md:w-5" />
                    <span className="text-sm md:text-base">Aprobando...</span>
                  </span>
                }
                className="min-h-[48px] w-full bg-green-600 text-sm font-semibold hover:bg-green-700 md:min-h-[52px] md:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-base md:text-lg">✅</span>
                  <span className="truncate">Aprobar y Agregar al Equipo</span>
                </span>
              </ButtonSubmit>
            </Form>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 md:p-6">
            <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-red-400 md:mb-4 md:text-lg">
              ❌ Rechazar Solicitud
            </h4>
            <Form action={rejectAction}>
              <input type="hidden" name="request_id" value={request.id} />

              <div className="mb-4 md:mb-6">
                <div className="flex w-full flex-col space-y-2">
                  <label htmlFor="rejection_reason" className="text-foreground text-sm font-medium md:text-base">
                    Motivo de Rechazo (Opcional)
                  </label>
                  <textarea
                    id="rejection_reason"
                    name="rejection_reason"
                    placeholder="Explica el motivo del rechazo..."
                    rows={3}
                    maxLength={500}
                    className="border-border-header bg-background-header placeholder-foreground/50 text-foreground w-full rounded-lg border-2 p-3 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-400 focus:outline-hidden md:p-4 md:text-base"
                  />
                </div>
              </div>

              <ButtonSubmit
                processing={
                  <span className="flex items-center gap-2">
                    <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent md:h-5 md:w-5" />
                    <span className="text-sm md:text-base">Rechazando...</span>
                  </span>
                }
                className="min-h-[48px] w-full bg-red-600 text-sm font-semibold hover:bg-red-700 md:min-h-[52px] md:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-base md:text-lg">❌</span>
                  <span>Rechazar Solicitud</span>
                </span>
              </ButtonSubmit>
            </Form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
