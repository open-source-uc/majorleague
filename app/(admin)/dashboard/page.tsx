import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function Dashboard() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <section className="mx-10 mt-8 flex flex-col">
      <h1 className="text-2xl font-bold">
        Administra la <span className="text-primary-darken">Major League</span>
      </h1>
      <div className="grid grid-cols-3 gap-4 py-10">
        <Link href="/dashboard/profiles" className="text-primary-darken">
          Perfiles
        </Link>
        <Link href="/dashboard/teams" className="text-primary-darken">
          Equipos
        </Link>
        <Link href="/dashboard/competitions" className="text-primary-darken">
          Competiciones
        </Link>
        <Link href="/dashboard/matches" className="text-primary-darken">
          Partidos
        </Link>
        <Link href="/dashboard/streams" className="text-primary-darken">
          Streams
        </Link>
        <Link href="/dashboard/notifications" className="text-primary-darken">
          Notificaciones
        </Link>
        <Link href="/dashboard/preferences" className="text-primary-darken">
          Preferencias
        </Link>
        <Link href="/dashboard/join-team-requests" className="text-primary-darken">
          Solicitudes de unión a equipo
        </Link>
        <Link href="/dashboard/players" className="text-primary-darken">
          Jugadores
        </Link>
        <Link href="/dashboard/lineups" className="text-primary-darken">
          Lineups
        </Link>
        <Link href="/dashboard/events" className="text-primary-darken">
          Eventos
        </Link>
      </div>
    </section>
  );
}
