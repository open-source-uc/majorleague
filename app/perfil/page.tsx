import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlayerByProfileId, getJoinRequestsByProfileId } from "@/actions/auth";
import { getAuthStatus } from "@/lib/services/auth";
import { calculateAge } from "@/lib/utils/cn";

export const runtime = "edge";

export default async function Perfil() {
  const { isAdmin, isAuthenticated, userProfile } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    return redirect("/login");
  }

  const playerInfo = await getPlayerByProfileId(userProfile.id);
  const pendingRequests = await getJoinRequestsByProfileId(userProfile.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold">
          Mi <span className="text-primary-darken">Perfil</span>
        </h1>
        <p className="text-ml-grey text-lg">Gestiona tu información personal y configuraciones de Major League UC</p>
      </div>

      <div className="bg-background-header border-border-header mb-8 rounded-lg border p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-background flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
              {userProfile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-primary text-2xl font-bold">{userProfile.username}</h2>
              <p className="text-ml-grey text-sm">
                Miembro desde {userProfile.created_at ? formatDate(userProfile.created_at) : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <span className="bg-primary-darken text-background rounded-full px-3 py-1 text-sm font-medium">
                Administrador
              </span>
            ) : null}
            {playerInfo ? (
              <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-sm font-medium">
                Jugador Registrado
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">Nombre de Usuario</label>
            <div className="bg-background border-border-header text-foreground rounded-md border p-3">
              {userProfile.username}
            </div>
          </div>
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">Correo Electrónico</label>
            <div className="bg-background border-border-header text-foreground rounded-md border p-3">
              {userProfile.email || <span className="text-ml-grey italic">No especificado</span>}
            </div>
          </div>
        </div>
      </div>

      {playerInfo ? (
        <div className="bg-background-header border-border-header mb-8 rounded-lg border p-8">
          <h3 className="text-foreground mb-6 flex items-center gap-2 text-xl font-semibold">
            <span className="text-primary text-2xl">⚽</span>
            Información de Jugador
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Nombre Completo</label>
                <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                  {playerInfo.first_name} {playerInfo.last_name}
                  {playerInfo.nickname ? (
                    <span className="text-ml-grey ml-2">&quot;{playerInfo.nickname}&quot;</span>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Posición</label>
                <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                  {getPositionName(playerInfo.position)}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Equipo</label>
                <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                  {playerInfo.team_name || <span className="text-ml-grey italic">Sin equipo asignado</span>}
                </div>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Edad</label>
                <div className="bg-background border-border-header text-foreground rounded-md border p-3">
                  {calculateAge(playerInfo.birthday)} años
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!playerInfo && pendingRequests.length === 0 && (
        <div className="bg-primary/10 border-primary/30 mb-8 rounded-lg border p-8 text-center">
          <div className="text-primary mb-4 text-4xl">🚀</div>
          <h3 className="text-foreground mb-2 text-xl font-semibold">¡Únete a la Liga!</h3>
          <p className="text-ml-grey mb-6">
            ¿Listo para formar parte de Major League UC? Solicita unirte a un equipo y comienza tu aventura
            futbolística.
          </p>
          <Link
            href="/participa"
            className="bg-primary-darken hover:bg-primary text-background inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            <span>⚽</span>
            Solicitar Participación
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-foreground mb-4 text-xl font-semibold">Acciones Rápidas</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex items-center gap-3 rounded-lg border p-4 transition-colors"
          >
            <div className="text-primary text-xl">🏠</div>
            <div>
              <div className="font-medium">Inicio</div>
              <div className="text-ml-grey text-sm">Volver al inicio</div>
            </div>
          </Link>

          <Link
            href="/posiciones"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex items-center gap-3 rounded-lg border p-4 transition-colors"
          >
            <div className="text-primary text-xl">🏆</div>
            <div>
              <div className="font-medium">Posiciones</div>
              <div className="text-ml-grey text-sm">Ver tabla de posiciones</div>
            </div>
          </Link>

          <Link
            href="/equipos"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex items-center gap-3 rounded-lg border p-4 transition-colors"
          >
            <div className="text-primary text-xl">⚽</div>
            <div>
              <div className="font-medium">Equipos</div>
              <div className="text-ml-grey text-sm">Conocer los equipos</div>
            </div>
          </Link>

          <Link
            href="/participa/gracias"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex items-center gap-3 rounded-lg border p-4 transition-colors"
          >
            <div className="text-primary text-xl">📋</div>
            <div>
              <div className="font-medium">Estado de Solicitud</div>
              <div className="text-ml-grey text-sm">Ver estado de participación</div>
            </div>
          </Link>

          {isAdmin ? (
            <Link
              href="/dashboard"
              className="bg-primary-darken hover:bg-primary text-background flex items-center gap-3 rounded-lg p-4 transition-colors"
            >
              <div className="text-xl">⚙️</div>
              <div>
                <div className="font-medium">Panel Admin</div>
                <div className="text-sm opacity-90">Gestionar sistema</div>
              </div>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="bg-background-header border-border-header rounded-lg border p-8">
        <h3 className="text-foreground mb-4 text-xl font-semibold">Gestión de Cuenta</h3>
        <div className="space-y-4">
          <div className="border-border-header rounded-lg border p-4">
            <h4 className="text-foreground mb-2 font-medium">Autenticación OSUC</h4>
            <p className="text-ml-grey mb-4 text-sm">
              Tu cuenta está vinculada con el sistema de autenticación de OSUC. Para actualizar tu información personal
              o cerrar sesión, utiliza el portal oficial.
            </p>
            <Link
              href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
              className="text-primary-darken hover:text-primary border-primary-darken hover:border-primary inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              <span>🔗</span>
              Ir a Portal OSUC
            </Link>
          </div>

          <div className="border-border-header rounded-lg border p-4">
            <h4 className="text-foreground mb-2 font-medium">Soporte</h4>
            <p className="text-ml-grey mb-4 text-sm">
              ¿Tienes problemas con tu cuenta o necesitas ayuda? Contacta al equipo de soporte.
            </p>
            <div className="flex gap-2">
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="text-ml-grey hover:text-foreground inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm transition-colors"
              >
                <span>📧</span>
                Contactanos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
