import Link from "next/link";
import { redirect } from "next/navigation";

import { isPlanillero } from "@/actions/planilleros";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function PlanilleroLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userProfile } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    redirect("/login");
  }

  const userIsPlanillero = await isPlanillero(userProfile.id);
  if (!userIsPlanillero) {
    redirect("/perfil");
  }

  return (
    <div className="bg-background min-h-screen">
      <nav className="bg-background-header border-border-header border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <h1 className="text-foreground text-xl font-semibold">Panel Planillero</h1>
            <Link
              href="/perfil"
              className="text-primary-darken hover:text-primary ml-auto inline-flex items-center transition-colors"
            >
              ← Volver al Perfil
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
