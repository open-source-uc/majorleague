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
      title: "Gestión de Jornadas",
      icon: "📅",
      items: [
        {
          name: "Jornadas de Partidos",
          href: "/dashboard/match-days",
          description: "Gestiona jornadas completas",
          icon: "🏟️",
        },
        {
          name: "Vista Individual de Partidos",
          href: "/dashboard/matches",
          description: "Gestión tradicional de partidos individuales",
          icon: "⚽",
        },
        {
          name: "Planilleros",
          href: "/dashboard/planilleros",
          description: "Asignar y gestionar planilleros para partidos",
          icon: "📋",
        },
      ],
    },
    {
      title: "Competiciones y Equipos",
      icon: "🏆",
      items: [
        { name: "Equipos", href: "/dashboard/teams", description: "Administrar equipos y configuraciones", icon: "⚽" },
        {
          name: "Competiciones",
          href: "/dashboard/competitions",
          description: "Gestionar competiciones y torneos",
          icon: "🏆",
        },
      ],
    },
    {
      title: "Eventos y Medios",
      icon: "📺",
      items: [
        { name: "Streams", href: "/dashboard/streams", description: "Gestionar transmisiones en vivo", icon: "📡" },
        { name: "Eventos", href: "/dashboard/events", description: "Administrar eventos individuales", icon: "⚡" },
        {
          name: "Jugadores de Eventos",
          href: "/dashboard/event-players",
          description: "Administrar jugadores de eventos",
          icon: "👤",
        },
        { name: "Lineups", href: "/dashboard/lineups", description: "Configurar alineaciones de equipos", icon: "📋" },
      ],
    },
    {
      title: "Gestión de Usuarios",
      icon: "👥",
      items: [
        { name: "Perfiles", href: "/dashboard/profiles", description: "Gestionar perfiles de usuarios", icon: "👤" },
        { name: "Jugadores", href: "/dashboard/players", description: "Administrar jugadores registrados", icon: "⚽" },
        {
          name: "Solicitudes de Unión",
          href: "/dashboard/join-requests",
          description: "Revisar solicitudes de unión a equipos",
          icon: "📝",
        },
      ],
    },
    {
      title: "Configuración",
      icon: "⚙️",
      items: [
        {
          name: "Notificaciones",
          href: "/dashboard/notifications",
          description: "Gestionar notificaciones del sistema",
          icon: "🔔",
        },
        {
          name: "Preferencias",
          href: "/dashboard/preferences",
          description: "Configurar preferencias de usuarios",
          icon: "⚙️",
        },
      ],
    },
  ];

  return (
    <div className="from-background via-card to-background relative min-h-screen overflow-hidden bg-gradient-to-br">
      {/* Subtle background pattern - consistent with login */}
      <div className="absolute inset-0 opacity-5">
        <div className="bg-primary absolute top-1/4 left-1/4 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-accent absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div className="tablet:px-8 desktop:px-12 relative z-10 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          {/* Clean Header Section */}
          <div className="mb-12 text-center">
            <h1 className="text-foreground tablet:text-4xl mb-4 text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground mb-6 text-lg">Gestiona Major League UC desde un solo lugar</p>
          </div>

          {/* Clean Sections Grid */}
          <div className="space-y-12">
            {adminSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h2 className="text-foreground text-xl font-semibold">{section.title}</h2>
                </div>

                {/* Cards Grid */}
                <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid gap-4">
                  {section.items.map((item, itemIndex) => (
                    <Link key={itemIndex} href={item.href} className="group relative">
                      {/* Hover Effect Background */}
                      <div className="from-primary/20 to-accent/20 absolute -inset-1 rounded-xl bg-gradient-to-r opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Card Content */}
                      <div className="border-border/50 bg-card/95 group-hover:border-primary/30 relative rounded-xl border p-6 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:scale-105">
                        <div className="flex items-start gap-4">
                          <div className="text-2xl transition-transform duration-300 group-hover:scale-110">
                            {item.icon}
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="text-foreground group-hover:text-primary font-semibold transition-colors duration-300">
                              {item.name}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                          </div>
                        </div>

                        {/* Arrow Indicator */}
                        <div className="mt-4 flex justify-end">
                          <div className="bg-primary/10 group-hover:bg-primary/20 rounded-full p-2 transition-colors duration-300">
                            <svg className="text-primary h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-center">
            <div className="border-border/30 bg-card/50 rounded-xl border p-6 backdrop-blur-sm">
              <p className="text-muted-foreground mb-2 text-sm">¿Necesitas ayuda con la administración?</p>
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="text-primary hover:text-primary/80 font-medium underline transition-colors"
              >
                Contacta al equipo técnico
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
