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
    colors: ["#174B84", "#B93228"],
    founded: "2024",
  },
  {
    name: "Industrial FC",
    logo: IndustrialFCLogo,
    departments: "Investigación Operativa",
    alt: "Logo de Industrial FC",
    colors: ["#FBFBFB", "#D9D9D9"],
    founded: "2024",
  },
  {
    name: "Manchester Civil",
    logo: ManchesterCivilLogo,
    departments: "Civil - Transporte - Construcción",
    alt: "Logo de Manchester Civil",
    colors: ["#F1DD0A", "#B58C00"],
    founded: "2024",
  },
  {
    name: "Mathchester Science",
    logo: MathchesterScienceLogo,
    departments: "Química - Física - Matemática Biomédica - Biología",
    alt: "Logo de Manchester Science",
    colors: ["#18C0DA", "#F8DC5E"],
    founded: "2019",
  },
  {
    name: "Minerham Forest",
    logo: MinerhamForestLogo,
    departments: "Minería - Ambiental - Hidráulica - Geociencias",
    alt: "Logo de Minerham Forest",
    colors: ["#313761", "#0C665D"],
    founded: "2024",
  },
  {
    name: "Naranja Mecanica",
    logo: NaranjaMecanicaLogo,
    departments: "Mecánica - Diseño e Innovación (IDI)",
    alt: "Logo de Naranja Mecanica",
    colors: ["#EF5B01", "#E96302"],
    founded: "2024",
  },
  {
    name: "New Boys",
    logo: NewBoysLogo,
    departments: "Novatos",
    alt: "Logo de New Boys",
    colors: ["#DC0000", "#FFD8D9"],
    founded: "2024",
  },
  {
    name: "Old Boys",
    logo: OldBoysLogo,
    departments: "Ex Alumnos",
    alt: "Logo de Old Boys",
    colors: ["#171A22", "#00F2EE"],
    founded: "2024",
  },
  {
    name: "Robovolt United",
    logo: RobovoltUnitedLogo,
    departments: "Eléctrica - Robótica",
    alt: "Logo de Robovolt United",
    colors: ["#030000", "#F53D57"],
    founded: "2024",
  },
];

export default function EquiposPage() {
  return (
    <>
      {/* Teams Grid */}
      <section className="px-5 py-16" aria-label="Equipos participantes del torneo">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Conoce a los Equipos</h2>
            <div className="mx-auto h-1 w-64 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
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
                      <p className="text-sm text-accent-foreground">
                        Est. {team.founded}
                      </p>
                    </div>
                  </div>


                  {/* Departments */}
                  <div className="rounded-lg border border-border/50 bg-background/30 p-3">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Majors Representados
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

    </>
  );
}
