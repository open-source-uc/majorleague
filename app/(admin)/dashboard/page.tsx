import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function Dashboard() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const adminSections = [
    {
      title: "GESTIÓN DE USUARIOS",
      items: [
        { name: "Perfiles", href: "/dashboard/profiles", description: "Gestionar perfiles de usuarios" },
        { name: "Jugadores", href: "/dashboard/players", description: "Administrar jugadores registrados" },
        {
          name: "Solicitudes de Unión",
          href: "/dashboard/join-requests",
          description: "Revisar solicitudes de unión a equipos",
        },
      ],
    },
    {
      title: "COMPETICIONES Y EQUIPOS",
      items: [
        { name: "Equipos", href: "/dashboard/teams", description: "Administrar equipos y configuraciones" },
        { name: "Competiciones", href: "/dashboard/competitions", description: "Gestionar competiciones y torneos" },
        { name: "Partidos", href: "/dashboard/matches", description: "Programar y gestionar partidos" },
        {
          name: "Planilleros",
          href: "/dashboard/planilleros",
          description: "Asignar y gestionar planilleros de partidos",
        },
      ],
    },
    {
      title: "EVENTOS Y MEDIOS",
      items: [
        { name: "Streams", href: "/dashboard/streams", description: "Gestionar transmisiones en vivo" },
        { name: "Eventos", href: "/dashboard/events", description: "Administrar eventos del partido" },
        { name: "Lineups", href: "/dashboard/lineups", description: "Configurar alineaciones de equipos" },
      ],
    },
    {
      title: "COMUNICACIONES",
      items: [
        {
          name: "Notificaciones",
          href: "/dashboard/notifications",
          description: "Gestionar notificaciones del sistema",
        },
        { name: "Preferencias", href: "/dashboard/preferences", description: "Configurar preferencias de usuarios" },
      ],
    },
  ];

  return (
    <section className="mx-10 mt-8 flex flex-col">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-ml-grey mt-2">
          Administra la <span className="text-primary-darken">Major League</span>
        </p>
      </div>

      <div className="space-y-10">
        {adminSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-foreground mb-6 text-xl font-bold">{section.title}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className="group border-border-header bg-background-header hover:border-primary-darken hover:bg-background-header/80 flex flex-col gap-2 rounded-lg border p-6 transition-all"
                >
                  <h3 className="text-foreground group-hover:text-primary-darken text-lg font-bold">{item.name}</h3>
                  <p className="text-ml-grey text-sm">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <p className="text-ml-grey text-sm">
          {adminSections.reduce((total, section) => total + section.items.length, 0)} módulos de gestión disponibles
        </p>
      </div>
    </section>
  );
}
