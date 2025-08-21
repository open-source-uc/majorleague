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
        {/* Floating Images */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Top Left */}
          <div className="absolute -top-10 -left-10 h-32 w-32 rotate-12 transform animate-pulse opacity-10">
            <Image
              src={heroImage}
              alt=""
              className="h-full w-full rounded-full object-cover blur-[1px]"
              loading="lazy"
              sizes="128px"
            />
          </div>

          {/* Top Right */}
          <div className="absolute -top-16 -right-8 h-40 w-40 -rotate-6 transform animate-pulse opacity-8 delay-1000">
            <Image
              src={heroImage}
              alt=""
              className="h-full w-full rounded-lg object-cover blur-[1px]"
              loading="lazy"
              sizes="160px"
            />
          </div>

          {/* Middle Left */}
          <div className="absolute top-1/2 -left-12 h-28 w-28 rotate-45 transform animate-pulse opacity-12 delay-2000">
            <Image
              src={heroImage}
              alt=""
              className="h-full w-full rounded-full object-cover blur-[1px]"
              loading="lazy"
              sizes="112px"
            />
          </div>

          {/* Middle Right */}
          <div className="absolute top-1/3 -right-16 h-36 w-36 -rotate-12 transform animate-pulse opacity-10 delay-3000">
            <Image
              src={heroImage}
              alt=""
              className="h-full w-full rounded-xl object-cover blur-[1px]"
              loading="lazy"
              sizes="144px"
            />
          </div>

          {/* Bottom Left */}
          <div className="absolute -bottom-8 -left-6 h-24 w-24 rotate-30 transform animate-pulse opacity-15 delay-4000">
            <Image
              src={heroImage}
              alt=""
              className="h-full w-full rounded-lg object-cover blur-[1px]"
              loading="lazy"
              sizes="96px"
            />
          </div>

          {/* Bottom Right */}
          <div className="absolute -right-10 -bottom-12 h-32 w-32 -rotate-20 transform animate-pulse opacity-8 delay-500">
            <Image
              src={heroImage}
              alt=""
              className="h-full w-full rounded-full object-cover blur-[1px]"
              loading="lazy"
              sizes="128px"
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold">Conoce a los Equipos</h2>
            <div className="from-primary to-primary/50 mx-auto h-1 w-64 rounded-full bg-gradient-to-r" />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <article
                key={team.name}
                className="group border-border bg-card hover:border-primary/50 hover:shadow-primary/20 focus-within:border-primary focus-within:outline-ring relative overflow-hidden rounded-2xl border transition-all duration-500 focus-within:outline focus-within:outline-2 hover:shadow-2xl"
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

                <div className="pointer-events-none absolute top-3 right-3 z-20">
                  <span
                    className="block h-2.5 w-2.5 rounded-full shadow-sm"
                    style={{ background: `linear-gradient(90deg, ${team.colors[0]}, ${team.colors[1]})` }}
                  />
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
                          loading="lazy"
                          sizes="48px"
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
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
