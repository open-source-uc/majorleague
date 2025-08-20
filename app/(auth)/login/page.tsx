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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-card to-background">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-accent blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
              
              {/* Streamlined Header */}
              <div className="mb-8 text-center">
                <div className="mb-4 text-4xl">⚽</div>
                <h1 className="mb-4 text-3xl font-bold text-foreground tablet:text-4xl">
                  ¡Perfil creado exitosamente!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Solo necesitamos algunos datos más para completar tu perfil deportivo
                </p>
              </div>

              {/* Clean Profile Creation Card */}
              <div className="relative">
                <div className="rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm tablet:p-8">
                  <div className="mb-6 text-center">
                    <h2 className="mb-2 text-xl font-semibold text-foreground">
                      Completa tu perfil
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Te tomará menos de 2 minutos
                    </p>
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-card to-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-accent blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Clean, Focused Login Card */}
          <div className="text-center mb-8">
            <div className="mb-6 text-6xl">⚽</div>
            <h1 className="mb-4 text-3xl font-bold text-foreground tablet:text-4xl">
              Major League UC
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              El torneo de fútbol estudiantil más grande de la UC
            </p>
          </div>

          {/* Primary Login Card */}
          <div className="rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm mb-8">
            <Button 
              size="lg" 
              className="w-full mb-4 text-lg font-semibold py-4"
              href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
            >
              🔐 Continuar con OSUC
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              Acceso seguro mediante tu cuenta estudiantil
            </p>
          </div>

          {/* Support Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ¿Problemas para acceder?{" "}
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="text-primary hover:text-primary/80 font-medium transition-colors underline"
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
