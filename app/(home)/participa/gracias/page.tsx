import Link from "next/link";
import { redirect } from "next/navigation";

import { getParticipation } from "@/actions/participation";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function GraciasPage() {
  const { isAuthenticated, userProfile } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    redirect("/login");
  }

  const participation = await getParticipation(userProfile.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "yellow",
          icon: "⏳",
          title: "Solicitud Pendiente",
          description: "Tu solicitud está siendo revisada por el equipo. Te contactaremos pronto.",
        };
      case "approved":
        return {
          color: "green",
          icon: "✅",
          title: "¡Solicitud Aprobada!",
          description: "¡Felicidades! Has sido aceptado en el equipo. Pronto recibirás más información.",
        };
      case "rejected":
        return {
          color: "red",
          icon: "❌",
          title: "Solicitud Rechazada",
          description: "Tu solicitud no fue aprobada en esta ocasión. Puedes intentar con otro equipo.",
        };
      default:
        return {
          color: "gray",
          icon: "❓",
          title: "Estado Desconocido",
          description: "No pudimos determinar el estado de tu solicitud.",
        };
    }
  };

  const getPositionName = (position: string) => {
    const positions = {
      GK: "Portero",
      DEF: "Defensa",
      MID: "Mediocampo",
      FWD: "Delantero",
    };
    return positions[position as keyof typeof positions] || position;
  };

  if (!participation) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold">
            Estado de tu <span className="text-primary-darken">Solicitud</span>
          </h1>
          <p className="text-ml-grey text-lg">Aquí puedes ver el estado actual de tu solicitud de participación</p>
        </div>

        <div className="mb-8">
          <div className="rounded-lg border border-gray-500/30 bg-gray-500/10 p-8 text-center">
            <div className="mb-4 text-6xl">📭</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-400">No hay solicitudes</h2>
            <p className="text-ml-grey mb-6 text-lg">
              Aún no has enviado ninguna solicitud de participación a Major League UC.
            </p>
            <Link
              href="/participa"
              className="bg-primary-darken hover:bg-primary text-background inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              <span>⚽</span>
              Solicitar Participación
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/perfil"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex items-center justify-center gap-2 rounded-lg border px-6 py-3 transition-colors"
          >
            <span>👤</span>
            Ver Mi Perfil
          </Link>

          <Link
            href="/equipos"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex items-center justify-center gap-2 rounded-lg border px-6 py-3 transition-colors"
          >
            <span>⚽</span>
            Ver Equipos
          </Link>

          <Link
            href="/"
            className="bg-primary-darken hover:bg-primary text-background flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-colors"
          >
            <span>🏠</span>
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(participation.status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold">
          Estado de tu <span className="text-primary-darken">Solicitud</span>
        </h1>
        <p className="text-ml-grey text-lg">Aquí puedes ver el estado actual de tu solicitud de participación</p>
      </div>

      <div className="mb-8">
        <div
          className={`rounded-lg border p-8 text-center ${
            statusInfo.color === "green"
              ? "border-green-500/30 bg-green-500/10"
              : statusInfo.color === "red"
                ? "border-red-500/30 bg-red-500/10"
                : statusInfo.color === "yellow"
                  ? "border-yellow-500/30 bg-yellow-500/10"
                  : "border-gray-500/30 bg-gray-500/10"
          }`}
        >
          <div className="mb-4 text-6xl">{statusInfo.icon}</div>
          <h2
            className={`mb-2 text-2xl font-bold ${
              statusInfo.color === "green"
                ? "text-green-400"
                : statusInfo.color === "red"
                  ? "text-red-400"
                  : statusInfo.color === "yellow"
                    ? "text-yellow-400"
                    : "text-gray-400"
            }`}
          >
            {statusInfo.title}
          </h2>
          <p className="text-ml-grey text-lg">{statusInfo.description}</p>
        </div>
      </div>

      <div className="bg-background-header border-border-header mb-8 rounded-lg border p-8">
        <h3 className="text-foreground mb-6 flex items-center gap-2 text-xl font-semibold">
          <span className="text-primary text-2xl">📋</span>
          Detalles de tu Solicitud
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Nombre Completo</label>
              <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                {participation.first_name} {participation.last_name}
              </div>
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Equipo Solicitado</label>
              <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                {participation.team_name || "Equipo no encontrado"}
              </div>
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Posición Preferida</label>
              <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                {getPositionName(participation.preferred_position)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Fecha de Nacimiento</label>
              <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                {participation.birthday ? formatDate(participation.birthday) : "No disponible"}
              </div>
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Fecha de Solicitud</label>
              <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                {participation.created_at ? formatDate(participation.created_at) : "No disponible"}
              </div>
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Estado Actual</label>
              <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm ${
                    statusInfo.color === "green"
                      ? "bg-green-500/20 text-green-400"
                      : statusInfo.color === "red"
                        ? "bg-red-500/20 text-red-400"
                        : statusInfo.color === "yellow"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {statusInfo.icon}
                  {statusInfo.title}
                </span>
              </div>
            </div>
          </div>
        </div>

        {participation.notes ? (
          <div className="mt-6">
            <label className="text-foreground mb-2 block text-sm font-medium">Comentarios Adicionales</label>
            <div className="bg-background border-border-header text-foreground rounded-md border p-3">
              {participation.notes}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {participation.status === "pending" && (
          <div className="bg-primary/10 border-primary/30 rounded-lg border p-6 text-center">
            <h3 className="text-foreground mb-2 text-lg font-semibold">¿Qué sigue?</h3>
            <p className="text-ml-grey mb-4 text-sm">
              Tu solicitud está siendo revisada. El proceso puede tomar algunos días. Te notificaremos por correo
              electrónico cuando tengamos una respuesta.
            </p>
          </div>
        )}

        {participation.status === "approved" && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-green-400">¡Bienvenido al equipo!</h3>
            <p className="text-ml-grey mb-4 text-sm">
              Pronto recibirás información sobre entrenamientos, horarios de partidos y próximos eventos.
            </p>
          </div>
        )}

        {participation.status === "rejected" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-red-400">No te desanimes</h3>
            <p className="text-ml-grey mb-4 text-sm">
              Aunque no fuiste seleccionado esta vez, puedes intentar con otro equipo o en la próxima temporada.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/perfil"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex items-center justify-center gap-2 rounded-lg border px-6 py-3 transition-colors"
          >
            <span>👤</span>
            Ver Mi Perfil
          </Link>

          <Link
            href="/equipos"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex items-center justify-center gap-2 rounded-lg border px-6 py-3 transition-colors"
          >
            <span>⚽</span>
            Ver Equipos
          </Link>

          <Link
            href="/"
            className="bg-primary-darken hover:bg-primary text-background flex items-center justify-center gap-2 rounded-lg px-6 py-3 transition-colors"
          >
            <span>🏠</span>
            Volver al Inicio
          </Link>
        </div>
      </div>

      <div className="bg-background-header border-border-header mt-8 rounded-lg border p-6 text-center">
        <h3 className="text-foreground mb-2 text-lg font-semibold">¿Tienes preguntas?</h3>
        <p className="text-ml-grey mb-4 text-sm">
          Si necesitas más información o tienes alguna duda sobre tu solicitud, no dudes en contactarnos.
        </p>
        <Link
          href="https://www.instagram.com/opensource_euc/"
          target="_blank"
          className="text-primary hover:text-primary-darken inline-flex items-center gap-2 text-sm transition-colors"
        >
          <span>📧</span>
          Contactanos
        </Link>
      </div>
    </div>
  );
}
