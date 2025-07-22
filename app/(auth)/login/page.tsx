import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfile } from "@/actions/auth";
import FormProfile from "@/components/forms/FormProfile";
import { getUserDataByToken } from "@/lib/services/auth";

export const runtime = "edge";

export default async function Login() {
  const userData = await getUserDataByToken();
  if (userData) {
    const userProfile = await getProfile(userData);
    if (!userProfile) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="mb-8 text-center">
            <h1 className="text-foreground mb-4 text-3xl font-bold">
              ¡Bienvenido a <span className="text-primary-darken">Major League UC</span>!
            </h1>
            <p className="text-ml-grey mb-6 text-lg">
              Tu cuenta OSUC ha sido verificada exitosamente. Ahora necesitamos crear tu perfil para completar el
              proceso de registro.
            </p>
            <div className="bg-background-header border-border-header mb-8 rounded-lg border p-6">
              <div className="flex items-start gap-4">
                <div className="text-primary text-2xl">ℹ️</div>
                <div className="text-left">
                  <h3 className="text-foreground mb-2 text-xl font-semibold">¿Por qué necesito crear un perfil?</h3>
                  <ul className="text-ml-grey space-y-1 text-sm">
                    <li>• Tu perfil te permitirá participar en la liga</li>
                    <li>• Podrás ver tus estadísticas y seguir tu progreso</li>
                    <li>• Recibirás notificaciones sobre partidos y eventos</li>
                    <li>• Tendrás acceso completo a todas las funcionalidades</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background-header border-border-header rounded-lg border p-8">
            <h2 className="text-primary mb-6 text-center text-xl font-bold">Crear Mi Perfil</h2>
            <FormProfile userId={userData.id} />
          </div>
        </div>
      );
    }
    redirect("/perfil");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-12 text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold">
          Únete a <span className="text-primary-darken">Major League UC</span>
        </h1>
        <p className="text-ml-grey mb-8 text-xl">La liga de fútbol más emocionante de la Universidad Católica</p>
      </div>

      <div className="mb-12">
        <h2 className="text-foreground mb-6 text-center text-2xl font-semibold">Proceso de Registro</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-background-header border-border-header rounded-lg border p-6 text-center">
            <div className="text-primary mb-4 text-3xl">1️⃣</div>
            <h3 className="text-foreground mb-2 text-2xl font-semibold">Autenticación OSUC</h3>
            <p className="text-ml-grey text-sm">Inicia sesión o regístrate con tu cuenta oficial de OSUC</p>
          </div>
          <div className="bg-background-header border-border-header rounded-lg border p-6 text-center">
            <div className="text-primary mb-4 text-3xl">2️⃣</div>
            <h3 className="text-foreground mb-2 text-2xl font-semibold">Crear Perfil</h3>
            <p className="text-ml-grey text-sm">Completa tu información básica para Major League UC</p>
          </div>
          <div className="bg-background-header border-border-header rounded-lg border p-6 text-center">
            <div className="text-primary mb-4 text-3xl">3️⃣</div>
            <h3 className="text-foreground mb-2 text-2xl font-semibold">¡Listo!</h3>
            <p className="text-ml-grey text-sm">Accede a tu perfil y disfruta de Major League UC</p>
          </div>
        </div>
      </div>

      <div className="bg-background-header border-border-header rounded-lg border p-8 text-center">
        <h3 className="text-foreground mb-4 text-2xl font-semibold">¿Listo para comenzar?</h3>
        <p className="text-ml-grey mb-6 px-10">
          Usa tu cuenta OSUC para acceder al sistema. Si no tienes una cuenta, puedes crearla directamente en el portal
          de autenticación.
        </p>

        <Link
          href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
          className="bg-primary-darken hover:bg-primary text-background inline-flex items-center gap-3 rounded-lg px-6 py-3 text-lg font-semibold transition-colors"
        >
          <span>🔐</span>
          Iniciar con Cuenta OSUC
        </Link>

        <div className="border-border-header mt-6 border-t pt-6">
          <p className="text-ml-grey text-sm">
            ¿Problemas para acceder?
            <Link
              href="https://www.instagram.com/opensource_euc/"
              target="_blank"
              className="text-primary hover:text-primary-darken pl-2"
            >
              Contactanos
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-foreground mb-6 text-center text-2xl font-semibold">
          Lo que puedes hacer en Major League UC
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-background-header border-border-header rounded-lg border p-4">
            <div className="text-primary mb-2 text-2xl">⚽</div>
            <h4 className="text-foreground mb-1 font-medium">Seguir Equipos</h4>
            <p className="text-ml-grey text-xs">Conoce todos los equipos participantes</p>
          </div>
          <div className="bg-background-header border-border-header rounded-lg border p-4">
            <div className="text-primary mb-2 text-2xl">🏆</div>
            <h4 className="text-foreground mb-1 font-medium">Ver Posiciones</h4>
            <p className="text-ml-grey text-xs">Tabla de posiciones actualizada</p>
          </div>
          <div className="bg-background-header border-border-header rounded-lg border p-4">
            <div className="text-primary mb-2 text-2xl">📺</div>
            <h4 className="text-foreground mb-1 font-medium">Ver Partidos</h4>
            <p className="text-ml-grey text-xs">Transmisiones en vivo</p>
          </div>
          <div className="bg-background-header border-border-header rounded-lg border p-4">
            <div className="text-primary mb-2 text-2xl">🎯</div>
            <h4 className="text-foreground mb-1 font-medium">Participar</h4>
            <p className="text-ml-grey text-xs">Únete a un equipo y juega</p>
          </div>
        </div>
      </div>
    </div>
  );
}
