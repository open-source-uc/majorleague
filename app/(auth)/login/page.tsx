import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfile } from "@/actions/auth";
import FormProfile from "@/components/forms/FormProfile";
import Button from "@/components/ui/Button";
import { getUserDataByToken } from "@/lib/services/auth";

export const runtime = "edge";

export default async function Login() {
  const userData = await getUserDataByToken();
  if (userData) {
    const userProfile = await getProfile(userData);
    if (!userProfile) {
      return (
        <div className="from-background via-card to-background relative min-h-screen overflow-hidden bg-gradient-to-br">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="bg-primary absolute top-1/3 left-1/3 h-64 w-64 rounded-full blur-3xl" />
            <div className="bg-accent absolute right-1/3 bottom-1/3 h-64 w-64 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
              {/* Streamlined Header */}
              <div className="mb-8 text-center">
                <div className="mb-4 text-4xl">⚽</div>
                <h1 className="text-foreground tablet:text-4xl mb-4 text-3xl font-bold">
                  ¡Perfil creado exitosamente!
                </h1>
                <p className="text-muted-foreground text-lg">
                  Solo necesitamos algunos datos más para completar tu perfil deportivo
                </p>
              </div>

              {/* Clean Profile Creation Card */}
              <div className="relative">
                <div className="border-border/50 bg-card/95 tablet:p-8 rounded-xl border p-6 shadow-sm backdrop-blur-sm">
                  <div className="mb-6 text-center">
                    <h2 className="text-foreground mb-2 text-xl font-semibold">Completa tu perfil</h2>
                    <p className="text-muted-foreground text-sm">Te tomará menos de 2 minutos</p>
                  </div>

                  <FormProfile userId={userData.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    redirect("/perfil");
  }

  return (
    <div className="from-background via-card to-background relative min-h-screen overflow-hidden bg-gradient-to-br">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="bg-primary absolute top-1/3 left-1/3 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-accent absolute right-1/3 bottom-1/3 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Clean, Focused Login Card */}
          <div className="mb-8 text-center">
            <div className="mb-6 text-6xl">⚽</div>
            <h1 className="text-foreground tablet:text-4xl mb-4 text-3xl font-bold">Major League UC</h1>
            <p className="text-muted-foreground mb-2 text-lg">El torneo de fútbol estudiantil más grande de la UC</p>
          </div>

          {/* Primary Login Card */}
          <div className="border-border/50 bg-card/95 mb-8 rounded-xl border p-6 shadow-sm backdrop-blur-sm">
            <Button
              size="lg"
              className="mb-4 w-full py-4 text-lg font-semibold"
              href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
            >
              🔐 Continuar con OSUC
            </Button>

            <p className="text-muted-foreground text-center text-xs">Acceso seguro mediante tu cuenta estudiantil</p>
          </div>

          {/* Support Link */}
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              ¿Problemas para acceder?{" "}
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="text-primary hover:text-primary/80 font-medium underline transition-colors"
              >
                Contáctanos aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
