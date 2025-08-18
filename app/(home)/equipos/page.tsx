import Image from "next/image";
import Link from "next/link";

import { teams } from "@/lib/constants/teams";

export const runtime = "edge";

export default function EquiposPage() {
  return (
    <>
      <h1 className="text-foreground mt-10 px-5 text-center text-4xl font-bold">
        Los Equipos de <span className="text-primary-darken">Major League UC</span>
      </h1>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, index) => (
              <Link href={`/equipos/${team.slug}`} key={team.name}>
                <div
                  key={team.name}
                  className="bg-background border-border-header hover:border-primary/50 flex flex-col items-center rounded-lg border p-6 transition-all"
                >
                  <div className="mb-4 flex h-24 w-24 items-center justify-center">
                    <Image
                      src={team.logo}
                      alt={team.alt}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      sizes="96px"
                      width={96}
                      height={96}
                    />
                  </div>
                  <h3 className="text-primary mb-3 text-center text-xl font-bold">{team.name}</h3>
                  <p className="text-ml-grey text-center text-sm leading-relaxed">{team.departments}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-4 flex flex-col items-center justify-center gap-10 px-5 py-10">
        <div className="flex max-w-4xl flex-col gap-5 text-center">
          <h2 className="text-primary-darken text-2xl font-bold">Una Liga, Múltiples Especialidades</h2>
          <p className="text-foreground text-lg">
            Cada equipo representa la excelencia de su área académica trasladada al campo de juego.
          </p>
        </div>
      </section>
    </>
  );
}
