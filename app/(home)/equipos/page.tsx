import Image from "next/image";

import AtleticoByteLogo from "@/../public/assets/teams/AtleticoByteLogo.png";
import IndustrialFCLogo from "@/../public/assets/teams/IndustrialFCLogo.png";
import ManchesterCivilLogo from "@/../public/assets/teams/ManchesterCivilLogo.png";
import MathchesterScienceLogo from "@/../public/assets/teams/MathchesterScienceLogo.png";
import MinerhamForestLogo from "@/../public/assets/teams/MinerhamForestLogo.png";
import NaranjaMecanicaLogo from "@/../public/assets/teams/NaranjaMecanicaLogo.png";
import NewBoysLogo from "@/../public/assets/teams/NewBoysLogo.png";
import OldBoysLogo from "@/../public/assets/teams/OldBoysLogo.png";
import RobovoltUnitedLogo from "@/../public/assets/teams/RobovoltUnitedLogo.png";

export const runtime = "edge";

const teams = [
  {
    name: "Atletico Byte",
    logo: AtleticoByteLogo,
    departments: "Computación - Software",
    alt: "Logo de Atletico Byte",
    colors: ["#3B82F6", "#1E40AF"],
    founded: "2019",
  },
  {
    name: "Industrial FC",
    logo: IndustrialFCLogo,
    departments: "Investigación Operativa",
    alt: "Logo de Industrial FC",
    colors: ["#F59E0B", "#D97706"],
    founded: "2018",
  },
  {
    name: "Manchester Civil",
    logo: ManchesterCivilLogo,
    departments: "Civil - Transporte - Construcción",
    alt: "Logo de Manchester Civil",
    colors: ["#EF4444", "#DC2626"],
    founded: "2017",
  },
  {
    name: "Mathchester Science",
    logo: MathchesterScienceLogo,
    departments: "Química - Física - Matemática Biomédica - Biología",
    alt: "Logo de Manchester Science",
    colors: ["#10B981", "#059669"],
    founded: "2019",
  },
  {
    name: "Minerham Forest",
    logo: MinerhamForestLogo,
    departments: "Minería - Ambiental - Hidráulica - Geociencias",
    alt: "Logo de Minerham Forest",
    colors: ["#059669", "#047857"],
    founded: "2018",
  },
  {
    name: "Naranja Mecanica",
    logo: NaranjaMecanicaLogo,
    departments: "Mecánica - Diseño e Innovación (IDI)",
    alt: "Logo de Naranja Mecanica",
    colors: ["#F97316", "#EA580C"],
    founded: "2020",
  },
  {
    name: "New Boys",
    logo: NewBoysLogo,
    departments: "Novatos",
    alt: "Logo de New Boys",
    colors: ["#8B5CF6", "#7C3AED"],
    founded: "2023",
  },
  {
    name: "Old Boys",
    logo: OldBoysLogo,
    departments: "Ex Alumnos",
    alt: "Logo de Old Boys",
    colors: ["#6B7280", "#4B5563"],
    founded: "2015",
  },
  {
    name: "Robovolt United",
    logo: RobovoltUnitedLogo,
    departments: "Eléctrica - Robótica",
    alt: "Logo de Robovolt United",
    colors: ["#06B6D4", "#0891B2"],
    founded: "2019",
  },
];

export default function EquiposPage() {
  return (
    <>
      {/* Hero Section - Tournament Style */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent)]" />
        <div className="relative px-5 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              ⚽ TEMPORADA 2024-2025
            </div>
            <h1 className="mb-6 text-5xl font-black tracking-tight text-foreground md:text-6xl">
              CONOCE A LOS 
              <span className="block text-primary">EQUIPOS</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              9 equipos legendarios. Una sola pasión. Descubre las fuerzas académicas que dominan el campo de juego en Major League UC.
            </p>
          </div>
        </div>
      </section>

      {/* Teams Grid - FIFA Style Cards */}
      <section className="px-5 py-16" aria-label="Equipos participantes del torneo">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Los Contendientes</h2>
            <div className="mx-auto h-1 w-24 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <article
                key={team.name}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 focus-within:border-primary focus-within:outline focus-within:outline-2 focus-within:outline-ring"
                tabIndex={0}
                role="button"
                aria-label={`Perfil del equipo ${team.name}`}
                style={{
                  background: `linear-gradient(135deg, ${team.colors[0]}08 0%, ${team.colors[1]}05 100%)`
                }}
              >
                {/* Team Colors Strip */}
                <div 
                  className="h-2 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${team.colors[0]} 0%, ${team.colors[1]} 100%)`
                  }}
                />
                
                {/* Card Content */}
                <div className="p-6">
                  {/* Header with Logo and Basic Info */}
                  <div className="mb-6 flex items-start gap-4">
                    <div className="relative">
                      <div 
                        className="absolute -inset-1 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                        style={{ backgroundColor: team.colors[0] }}
                      />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                        <Image
                          src={team.logo}
                          alt={team.alt}
                          className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                          sizes="48px"
                          width={48}
                          height={48}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="mb-1 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {team.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Est. {team.founded}
                      </p>
                    </div>
                  </div>


                  {/* Departments */}
                  <div className="rounded-lg border border-border/50 bg-background/30 p-3">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Facultades Representadas
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {team.departments}
                    </p>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${team.colors[0]} 0%, transparent 70%)`
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Info Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-5 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(120,119,198,0.2),transparent)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                Una Liga, <span className="text-primary">Múltiples Especialidades</span>
              </h2>
              <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
                Cada equipo representa la excelencia de su área académica trasladada al campo de juego. Desde la precisión
                de Ingeniería Civil hasta la innovación de Computación, desde la tradición de los Old Boys hasta el
                entusiasmo de los New Boys.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="mb-2 text-3xl font-black text-primary">9</div>
                  <div className="text-sm text-muted-foreground">Equipos Participantes</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-3xl font-black text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Facultades Representadas</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 blur-xl" />
              <div className="relative rounded-xl border border-primary/20 bg-background/80 p-8 backdrop-blur-sm">
                <h3 className="mb-4 text-xl font-bold text-foreground">🏆 Temporada Actual</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formato:</span>
                    <span className="font-medium text-foreground">Liga + Playoffs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Partidos:</span>
                    <span className="font-medium text-foreground">Todos vs Todos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temporada:</span>
                    <span className="font-medium text-foreground">2024-2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
