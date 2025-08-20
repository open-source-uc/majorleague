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
      title: "Gestión de Usuarios",
      icon: "👥",
      items: [
        { name: "Perfiles", href: "/dashboard/profiles", description: "Gestionar perfiles de usuarios", icon: "👤" },
        { name: "Jugadores", href: "/dashboard/players", description: "Administrar jugadores registrados", icon: "⚽" },
        {
          name: "Solicitudes de Unión",
          href: "/dashboard/join-requests",
          description: "Revisar solicitudes de unión a equipos",
          icon: "📝"
        },
      ],
    },
    {
      title: "Competiciones y Equipos",
      icon: "🏆",
      items: [
        { name: "Equipos", href: "/dashboard/teams", description: "Administrar equipos y configuraciones", icon: "⚽" },
        { name: "Competiciones", href: "/dashboard/competitions", description: "Gestionar competiciones y torneos", icon: "🏆" },
        { name: "Partidos", href: "/dashboard/matches", description: "Programar y gestionar partidos", icon: "📅" },
      ],
    },
    {
      title: "Eventos y Medios",
      icon: "📺",
      items: [
        { name: "Streams", href: "/dashboard/streams", description: "Gestionar transmisiones en vivo", icon: "📡" },
        { name: "Eventos", href: "/dashboard/events", description: "Administrar eventos del partido", icon: "⚡" },
        { name: "Lineups", href: "/dashboard/lineups", description: "Configurar alineaciones de equipos", icon: "📋" },
      ],
    },
    {
      title: "Comunicaciones",
      icon: "💬",
      items: [
        {
          name: "Notificaciones",
          href: "/dashboard/notifications",
          description: "Gestionar notificaciones del sistema",
          icon: "🔔"
        },
        { name: "Preferencias", href: "/dashboard/preferences", description: "Configurar preferencias de usuarios", icon: "⚙️" },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-card to-background">
      {/* Subtle background pattern - consistent with login */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent blur-3xl"></div>
      </div>
      
      <div className="relative z-10 px-4 py-16 tablet:px-8 desktop:px-12">
        <div className="mx-auto max-w-7xl">
          
          {/* Clean Header Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground tablet:text-4xl">
              Panel de Administración
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Gestiona Major League UC desde un solo lugar
            </p>
            
          </div>

          {/* Clean Sections Grid */}
          <div className="space-y-12">
            {adminSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-6">
                
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                </div>
                
                {/* Cards Grid */}
                <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className="group relative"
                    >
                      {/* Hover Effect Background */}
                      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100"></div>
                      
                      {/* Card Content */}
                      <div className="relative rounded-xl border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:border-primary/30">
                        <div className="flex items-start gap-4">
                          <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Arrow Indicator */}
                        <div className="mt-4 flex justify-end">
                          <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors duration-300">
                            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="rounded-xl border border-border/30 bg-card/50 p-6 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground mb-2">
                ¿Necesitas ayuda con la administración?
              </p>
              <Link
                href="https://www.instagram.com/opensource_euc/"
                target="_blank"
                className="text-primary hover:text-primary/80 font-medium transition-colors underline"
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
