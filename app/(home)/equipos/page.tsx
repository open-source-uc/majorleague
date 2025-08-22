import Image from "next/image";
import Link from "next/link";

import heroImage from "@/../public/assets/images/hero.webp";
import AtleticoByteLogo from "@/../public/assets/teams/AtleticoByteLogo.png";
import IndustrialFCLogo from "@/../public/assets/teams/IndustrialFCLogo.png";
import ManchesterCivilLogo from "@/../public/assets/teams/ManchesterCivilLogo.png";
import MathchesterScienceLogo from "@/../public/assets/teams/MathchesterScienceLogo.png";
import MinerhamForestLogo from "@/../public/assets/teams/MinerhamForestLogo.png";
import NaranjaMecanicaLogo from "@/../public/assets/teams/NaranjaMecanicaLogo.png";
import NewBoysLogo from "@/../public/assets/teams/NewBoysLogo.png";
import RobovoltUnitedLogo from "@/../public/assets/teams/RobovoltUnitedLogo.png";

export const runtime = "edge";

const teams = [
  {
    name: "Atletico Byte",
    logo: AtleticoByteLogo,
    departments: "Computación - Software",
    alt: "Logo de Atletico Byte",
    slug: "atletico-byte",
    colors: ["#174B84", "#B93228"],
    founded: "2024",
  },
  {
    name: "Industrial FC",
    logo: IndustrialFCLogo,
    departments: "Investigación Operativa",
    alt: "Logo de Industrial FC",
    slug: "industrial-fc",
    colors: ["#FBFBFB", "#D9D9D9"],
    founded: "2024",
  },
  {
    name: "Manchester Civil",
    logo: ManchesterCivilLogo,
    departments: "Civil - Transporte - Construcción",
    alt: "Logo de Manchester Civil",
    slug: "manchester-civil",
    colors: ["#F1DD0A", "#B58C00"],
    founded: "2024",
  },
  {
    name: "Mathchester Science",
    logo: MathchesterScienceLogo,
    departments: "Química - Física - Matemática Biomédica - Biología",
    alt: "Logo de Manchester Science",
    slug: "manchester-science",
    colors: ["#18C0DA", "#F8DC5E"],
    founded: "2019",
  },
  {
    name: "Minerham Forest",
    logo: MinerhamForestLogo,
    departments: "Minería - Ambiental - Hidráulica - Geociencias",
    alt: "Logo de Minerham Forest",
    slug: "minerham-forest",
    colors: ["#313761", "#0C665D"],
    founded: "2024",
  },
  {
    name: "Naranja Mecanica",
    logo: NaranjaMecanicaLogo,
    departments: "Mecánica - Diseño e Innovación (IDI)",
    alt: "Logo de Naranja Mecanica",
    slug: "naranja-mecanica",
    colors: ["#EF5B01", "#E96302"],
    founded: "2024",
  },
  {
    name: "New Boys",
    logo: NewBoysLogo,
    departments: "Novatos",
    alt: "Logo de New Boys",
    slug: "new-boys",
    colors: ["#DC0000", "#FFD8D9"],
    founded: "2024",
  },
  {
    name: "Robovolt United",
    logo: RobovoltUnitedLogo,
    departments: "Eléctrica - Robótica",
    alt: "Logo de Robovolt United",
    slug: "robovolt-united",
    colors: ["#030000", "#F53D57"],
    founded: "2024",
  },
];

export default function EquiposPage() {
  return (
    <>
      {/* Teams Grid */}
      <section className="relative px-5 py-16" aria-label="Equipos participantes del torneo">
        {/* Floating Images - Optimized with CSS masks to reuse single image */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover blur-[1px]"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>

          {/* Floating mask overlays for visual effects */}
          <div className="absolute -top-10 -left-10 h-32 w-32 rotate-12 transform animate-pulse rounded-full bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm delay-0" />
          <div className="absolute -top-16 -right-8 h-40 w-40 -rotate-6 transform animate-pulse rounded-lg bg-gradient-to-bl from-white/3 to-transparent backdrop-blur-sm delay-1000" />
          <div className="absolute top-1/2 -left-12 h-28 w-28 rotate-45 transform animate-pulse rounded-full bg-gradient-to-tr from-white/4 to-transparent backdrop-blur-sm delay-2000" />
          <div className="absolute top-1/3 -right-16 h-36 w-36 -rotate-12 transform animate-pulse rounded-xl bg-gradient-to-tl from-white/3 to-transparent backdrop-blur-sm delay-3000" />
          <div className="absolute -bottom-8 -left-6 h-24 w-24 rotate-30 transform animate-pulse rounded-lg bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm delay-4000" />
          <div className="absolute -right-10 -bottom-12 h-32 w-32 -rotate-20 transform animate-pulse rounded-full bg-gradient-to-bl from-white/3 to-transparent backdrop-blur-sm delay-500" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold">Conoce a los Equipos</h2>
            <div className="from-primary to-primary/50 mx-auto h-1 w-64 rounded-full bg-gradient-to-r" />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team, index) => {
              // First 6 teams are likely above-the-fold and should load with priority
              const isPriority = index < 6;

              return (
                <article
                  key={team.name}
                  className="group border-border bg-card hover:border-primary/50 hover:shadow-primary/20 focus-within:border-primary focus-within:outline-ring relative overflow-hidden rounded-2xl border transition-all duration-500 focus-within:outline-2 hover:shadow-2xl"
                  tabIndex={0}
                  role="button"
                  aria-label={`Perfil del equipo ${team.name}`}
                  style={{
                    background: `linear-gradient(135deg, ${team.colors[0]}08 0%, ${team.colors[1]}05 100%)`,
                  }}
                >
                  <Link
                    href={`/equipos/${team.slug}`}
                    aria-label={`Ir al equipo ${team.name}`}
                    className="absolute inset-0 z-10"
                  >
                    <span className="sr-only">{`Ir al equipo ${team.name}`}</span>
                  </Link>

                  <div className="pointer-events-none absolute top-4 right-3 z-20">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                      <svg
                        className="h-4 w-4 text-white/80 transition-transform duration-300 group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  {/* Team Colors Strip */}
                  <div
                    className="h-2 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${team.colors[0]} 0%, ${team.colors[1]} 100%)`,
                    }}
                  />

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Header with Logo and Basic Info */}
                    <div className="mb-6 flex items-start gap-4">
                      <div className="relative">
                        <div
                          className="absolute -inset-1 rounded-full opacity-20 transition-opacity duration-300 group-hover:opacity-40"
                          style={{ backgroundColor: team.colors[0] }}
                        />
                        <div className="bg-background/80 relative flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm">
                          <Image
                            src={team.logo}
                            alt={team.alt}
                            className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
                            priority={isPriority}
                            loading={isPriority ? undefined : "lazy"}
                            sizes="(max-width: 768px) 48px, (max-width: 1024px) 48px, 48px"
                            width={48}
                            height={48}
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-foreground group-hover:text-primary mb-1 text-xl font-bold transition-colors">
                          {team.name}
                        </h3>
                        <p className="text-accent-foreground text-sm">Est. {team.founded}</p>
                      </div>
                    </div>

                    {/* Departments */}
                    <div className="border-border/50 bg-background/30 rounded-lg border p-3">
                      <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                        Majors Representados
                      </h4>
                      <p className="text-foreground text-sm leading-relaxed">{team.departments}</p>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                    style={{
                      background: `radial-gradient(circle at center, ${team.colors[0]} 0%, transparent 70%)`,
                    }}
                  />
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
