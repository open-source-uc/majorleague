import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlayerByProfileId, getJoinRequestsByProfileId, isCaptain } from "@/actions/auth";
import { isPlanillero } from "@/actions/planilleros";
import { getAuthStatus } from "@/lib/services/auth";
import { calculateAge } from "@/lib/utils/cn";

export const runtime = "edge";

export default async function Perfil() {
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  const { isAdmin, isAuthenticated, userProfile } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    return redirect("/login");
  }

  const [playerInfo, pendingRequests, userIsPlanillero, userIsCaptain] = await Promise.all([
    getPlayerByProfileId(userProfile.id),
    getJoinRequestsByProfileId(userProfile.id),
    isPlanillero(userProfile.id),
    isCaptain(userProfile.id),
  ]);

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
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-10">
      <div className="mb-6 text-center md:mb-10">
        <h1 className="text-foreground mb-3 text-2xl font-bold md:mb-4 md:text-4xl">
          Mi <span className="text-primary-darken">Perfil</span>
        </h1>
        <p className="text-ml-grey px-2 text-base md:text-lg">
          Gestiona tu información personal y configuraciones de Major League UC
        </p>
      </div>

      <div className="bg-background-header border-border-header mb-6 rounded-lg border p-4 md:mb-8 md:p-8">
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-primary text-background flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold md:h-16 md:w-16 md:text-2xl">
                {userProfile.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-primary text-xl font-bold break-words md:text-2xl">{userProfile.username}</h2>
                <p className="text-ml-grey text-sm">
                  Miembro desde {userProfile.created_at ? formatDate(userProfile.created_at) : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-start gap-2 md:justify-end">
              {isAdmin ? (
                <span className="bg-primary-darken text-background rounded-full px-3 py-1 text-xs font-medium md:text-sm">
                  Administrador
                </span>
              ) : null}
              {playerInfo ? (
                <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-xs font-medium md:text-sm">
                  Jugador Registrado
                </span>
              ) : null}
              {userIsCaptain ? (
                <span className="bg-primary-darken text-background rounded-full px-3 py-1 text-xs font-medium md:text-sm">
                  Capitán
                </span>
              ) : null}
            </div>
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
        <div className="bg-background-header border-border-header mb-6 rounded-lg border p-4 md:mb-8 md:p-8">
          <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold md:mb-6 md:text-xl">
            <span className="text-primary text-xl md:text-2xl">⚽</span>
            Información de Jugador
          </h3>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Nombre Completo</label>
                <div className="bg-background border-border-header text-foreground flex min-h-[48px] items-center rounded-md border p-3">
                  <div className="break-words">
                    {playerInfo.first_name} {playerInfo.last_name}
                    {playerInfo.nickname ? (
                      <span className="text-ml-grey ml-2 block md:inline">&quot;{playerInfo.nickname}&quot;</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Posición</label>
                <div className="bg-background border-border-header text-foreground flex min-h-[48px] items-center rounded-md border p-3">
                  {getPositionName(playerInfo.position)}
                </div>
              </div>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Equipo</label>
                <div className="bg-background border-border-header text-foreground flex min-h-[48px] items-center rounded-md border p-3">
                  {playerInfo.team_name || <span className="text-ml-grey italic">Sin equipo asignado</span>}
                </div>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">Edad</label>
                <div className="bg-background border-border-header text-foreground flex min-h-[48px] items-center rounded-md border p-3">
                  {calculateAge(playerInfo.birthday)} años
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!playerInfo && pendingRequests.length === 0 && (
        <div className="bg-primary/10 border-primary/30 mb-6 rounded-lg border p-4 text-center md:mb-8 md:p-8">
          <div className="text-primary mb-3 text-3xl md:mb-4 md:text-4xl">🚀</div>
          <h3 className="text-foreground mb-2 text-lg font-semibold md:text-xl">¡Únete a la Liga!</h3>
          <p className="text-ml-grey mb-4 px-2 text-sm md:mb-6 md:text-base">
            ¿Listo para formar parte de Major League UC? Solicita unirte a un equipo y comienza tu aventura
            futbolística.
          </p>
          <Link
            href="/participa"
            className="bg-primary-darken hover:bg-primary text-background inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors md:px-6 md:py-3 md:text-base"
          >
            <span>⚽</span>
            Solicitar Participación
          </Link>
        </div>
      )}

      <div className="mb-6 md:mb-8">
        <h3 className="text-foreground mb-3 text-lg font-semibold md:mb-4 md:text-xl">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          <Link
            href="/"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex min-h-[64px] touch-manipulation items-center gap-3 rounded-lg border p-4 transition-colors active:scale-[0.98] md:min-h-[68px]"
          >
            <div className="text-primary flex-shrink-0 text-xl md:text-2xl">🏠</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium md:text-base">Inicio</div>
              <div className="text-ml-grey text-xs md:text-sm">Volver al inicio</div>
            </div>
          </Link>

          <Link
            href={`/posiciones/${year}/${semester}`}
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex min-h-[64px] touch-manipulation items-center gap-3 rounded-lg border p-4 transition-colors active:scale-[0.98] md:min-h-[68px]"
          >
            <div className="text-primary flex-shrink-0 text-xl md:text-2xl">🏆</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium md:text-base">Posiciones</div>
              <div className="text-ml-grey text-xs md:text-sm">Ver tabla de posiciones</div>
            </div>
          </Link>

          <Link
            href="/equipos"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex min-h-[64px] touch-manipulation items-center gap-3 rounded-lg border p-4 transition-colors active:scale-[0.98] md:min-h-[68px]"
          >
            <div className="text-primary flex-shrink-0 text-xl md:text-2xl">⚽</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium md:text-base">Equipos</div>
              <div className="text-ml-grey text-xs md:text-sm">Conocer los equipos</div>
            </div>
          </Link>

          <Link
            href="/participa/gracias"
            className="bg-background-header border-border-header hover:border-primary/50 text-foreground hover:text-primary flex min-h-[64px] touch-manipulation items-center gap-3 rounded-lg border p-4 transition-colors active:scale-[0.98] md:min-h-[68px]"
          >
            <div className="text-primary flex-shrink-0 text-xl md:text-2xl">📋</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium md:text-base">Estado de Solicitud</div>
              <div className="text-ml-grey text-xs md:text-sm">Ver estado de participación</div>
            </div>
          </Link>

          {userIsPlanillero ? (
            <Link
              href="/planillero"
              className="bg-primary-darken hover:bg-primary text-background flex min-h-[64px] touch-manipulation items-center gap-3 rounded-lg p-4 transition-colors active:scale-[0.98] md:min-h-[68px]"
            >
              <div className="flex-shrink-0 text-xl md:text-2xl">📝</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium md:text-base">Planillero</div>
                <div className="text-xs opacity-90 md:text-sm">Gestionar partidos asignados</div>
              </div>
            </Link>
          ) : null}

          {isAdmin ? (
            <Link
              href="/dashboard"
              className="bg-primary-darken hover:bg-primary text-background flex min-h-[64px] touch-manipulation items-center gap-3 rounded-lg p-4 transition-colors active:scale-[0.98] md:min-h-[68px]"
            >
              <div className="flex-shrink-0 text-xl md:text-2xl">⚙️</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium md:text-base">Panel Admin</div>
                <div className="text-xs opacity-90 md:text-sm">Gestionar sistema</div>
              </div>
            </Link>
          ) : null}

          {userIsCaptain ? (
            <Link
              href="/capitan/dashboard"
              className="bg-primary-darken hover:bg-primary text-background flex min-h-[64px] touch-manipulation items-center gap-3 rounded-lg p-4 transition-colors active:scale-[0.98] md:min-h-[68px]"
            >
              <div className="flex-shrink-0 text-xl md:text-2xl">🏆</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium md:text-base">Panel Capitán</div>
                <div className="text-xs opacity-90 md:text-sm">Gestionar equipo</div>
              </div>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="bg-background-header border-border-header rounded-lg border p-4 md:p-8">
        <h3 className="text-foreground mb-3 text-lg font-semibold md:mb-4 md:text-xl">Gestión de Cuenta</h3>
        <div className="space-y-3 md:space-y-4">
          <div className="border-border-header rounded-lg border p-3 md:p-4">
            <h4 className="text-foreground mb-2 text-sm font-medium md:text-base">Autenticación OSUC</h4>
            <p className="text-ml-grey mb-3 text-xs leading-relaxed md:mb-4 md:text-sm">
              Tu cuenta está vinculada con el sistema de autenticación de OSUC. Para actualizar tu información personal
              o cerrar sesión, utiliza el portal oficial.
            </p>
            <Link
              href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
              className="text-primary-darken hover:text-primary border-primary-darken hover:border-primary inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors active:scale-[0.98] md:px-4 md:py-2.5 md:text-sm"
            >
              <span>🔗</span>
              Ir a Portal OSUC
            </Link>
          </div>

          <div className="border-border-header rounded-lg border p-3 md:p-4">
            <h4 className="text-foreground mb-2 text-sm font-medium md:text-base">Soporte</h4>
            <p className="text-ml-grey mb-3 text-xs leading-relaxed md:mb-4 md:text-sm">
              ¿Tienes problemas con tu cuenta o necesitas ayuda? Contacta al equipo de soporte.
            </p>
            <div className="flex gap-2">
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="text-ml-grey hover:text-foreground inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md border border-transparent px-3 py-2 text-xs transition-colors active:scale-[0.98] md:px-4 md:py-2.5 md:text-sm"
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
