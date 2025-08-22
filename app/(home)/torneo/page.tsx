import type { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Torneo Major League UC",
  description:
    "Descubre el formato, calendario y estructura del torneo de fútbol universitario más emocionante de la UC. Conoce las fases, grupos y sistema de clasificación.",
  keywords: "torneo, calendario, formato, fútbol universitario, UC, Major League, fases, grupos, clasificación",
  openGraph: {
    title: "Torneo Major League UC",
    description:
      "Descubre el formato, calendario y estructura del torneo de fútbol universitario más emocionante de la UC.",
    url: "https://majorleague.uc.cl/torneo",
    images: [
      {
        url: "/assets/logo-horizontal.svg",
        width: 1200,
        height: 630,
        alt: "Torneo Major League UC",
      },
    ],
  },
};

export default function TorneoPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="from-primary/15 via-background to-background relative flex min-h-[70vh] items-center overflow-hidden bg-gradient-to-br">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,165,0,0.2),transparent)]" />

        {/* Floating Elements */}
        <div className="bg-primary/10 absolute top-20 left-10 h-32 w-32 animate-pulse rounded-full blur-xl" />
        <div
          className="absolute right-10 bottom-20 h-24 w-24 animate-pulse rounded-full bg-yellow-500/10 blur-xl"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/4 h-20 w-20 animate-pulse rounded-full bg-orange-500/10 blur-xl"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative w-full px-5 py-20">
          <div className="mx-auto max-w-5xl text-center">
            {/* Championship Badge */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-full border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 backdrop-blur-sm">
                <div className="text-6xl">🏆</div>
              </div>
            </div>

            <h1 className="text-foreground tablet:text-7xl desktop:text-8xl mb-8 text-6xl leading-none font-black tracking-tight">
              <span className="from-foreground to-foreground/80 block bg-gradient-to-r bg-clip-text text-transparent">
                EL TORNEO
              </span>
              <span className="from-primary via-primary to-primary/80 mt-2 block bg-gradient-to-r bg-clip-text text-transparent">
                DE MAJORS
              </span>
              <span className="text-muted-foreground mt-4 block text-2xl font-bold tracking-wide">
                2025 • TEMPORADA 2
              </span>
            </h1>

            <p className="text-foreground/90 mx-auto mb-8 max-w-3xl text-xl leading-relaxed font-medium">
              La competición más prestigiosa de la ingeniería UC. Ocho equipos, una pasión, un sueño:
              <strong className="text-primary"> ser campeones de Major League</strong>.
            </p>

            {/* Quick Stats */}
            <div className="text-muted-foreground flex justify-center gap-8 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚽</span>
                <span>8 Equipos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span>28 Partidos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <span>1 Campeón</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Info Section */}
      <section className="from-background via-primary/5 to-background relative bg-gradient-to-br px-5 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="tablet:grid-cols-2 tablet:items-center grid gap-16">
            <div>
              <div className="mb-8">
                <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
                  <span>🏆</span> MAJOR LEAGUE UC
                </div>
                <h2 className="text-foreground mb-6 text-4xl leading-tight font-black">
                  UNA LIGA,
                  <br />
                  <span className="from-primary via-primary to-primary/80 bg-gradient-to-r bg-clip-text text-transparent">
                    MÚLTIPLES
                  </span>
                  <br />
                  <span className="text-primary">ESPECIALIDADES</span>
                </h2>
              </div>

              <p className="text-foreground/90 mb-8 text-lg leading-relaxed font-medium">
                Cada equipo representa la excelencia académica trasladada al terreno de juego. La precisión de{" "}
                <strong>Ingeniería Civil</strong>, la innovación de <strong>Computación</strong> y el entusiasmo de los{" "}
                <strong>New Boys</strong>.
              </p>

              {/* Achievement Icons */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="mb-2 text-2xl">🎓</div>
                  <div className="text-foreground text-sm font-bold">Excelencia</div>
                  <div className="text-muted-foreground text-xs">Académica</div>
                </div>
                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="mb-2 text-2xl">⚽</div>
                  <div className="text-foreground text-sm font-bold">Pasión</div>
                  <div className="text-muted-foreground text-xs">Deportiva</div>
                </div>
                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="mb-2 text-2xl">🤝</div>
                  <div className="text-foreground text-sm font-bold">Espíritu</div>
                  <div className="text-muted-foreground text-xs">Competitivo</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Floating decoration */}
              <div className="from-primary/10 via-primary/5 absolute -inset-6 rounded-3xl bg-gradient-to-r to-orange-500/10 blur-2xl" />

              <div className="border-primary/20 from-background to-background/95 relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-8 shadow-2xl backdrop-blur-sm">
                <div className="from-primary/20 to-primary/5 absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br" />

                <div className="relative">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="from-primary to-primary/80 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white">
                      <span className="text-xl">🏟️</span>
                    </div>
                    <h3 className="text-foreground text-2xl font-black">TEMPORADA ACTUAL</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-primary/5 rounded-xl p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Formato</span>
                        <span className="text-foreground text-lg font-black">Liga + Playoffs</span>
                      </div>
                      <div className="bg-primary/20 h-1 overflow-hidden rounded-full">
                        <div className="from-primary to-primary/80 h-full w-3/4 rounded-full bg-gradient-to-r" />
                      </div>
                    </div>

                    <div className="rounded-xl bg-orange-500/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Sistema</span>
                        <span className="text-foreground text-lg font-black">Todos vs Todos</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-orange-500/20">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Período</span>
                        <span className="text-xl font-black text-yellow-600">2025-2</span>
                      </div>
                      <div className="text-muted-foreground text-xs font-medium">Segundo semestre académico</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Format Section */}
      <section className="from-background via-background to-primary/5 border-border/50 relative overflow-hidden border-t bg-gradient-to-br px-5 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,165,0,0.1),transparent)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="from-primary/10 text-primary border-primary/20 mb-6 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r to-orange-500/10 px-6 py-3 text-sm font-bold">
              <span>⚡</span> ESTRUCTURA DE COMPETICIÓN
            </div>
            <h2 className="text-foreground mb-6 text-5xl leading-tight font-black">
              <span className="block">FORMATO DEL</span>
              <span className="from-primary block bg-gradient-to-r via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                TORNEO
              </span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg font-medium">
              Tres fases épicas que definirán al campeón de Major League UC 2025-2
            </p>
            <div className="from-primary mx-auto mt-6 h-2 w-32 rounded-full bg-gradient-to-r via-orange-500 to-yellow-500" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Phase 1 - Group Stage */}
            <div className="group border-primary/10 from-background via-background to-primary/5 hover:border-primary/30 relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              {/* Decorative element */}
              <div className="from-primary/20 to-primary/5 absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br transition-transform duration-500 group-hover:scale-110" />

              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="from-primary to-primary/80 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black text-white shadow-lg">
                      01
                    </div>
                    <div>
                      <h3 className="text-foreground text-2xl leading-tight font-black">FASE</h3>
                      <h4 className="text-primary text-2xl leading-tight font-black">REGULAR</h4>
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">⚽</div>
                </div>

                <p className="text-muted-foreground mb-4 text-base leading-relaxed font-medium">
                  Sistema de liga donde cada equipo enfrenta a todos los demás. La consistencia y regularidad definen a
                  los equipos que merecen estar en playoffs.
                </p>

                <div className="text-muted-foreground mb-4 text-sm">
                  <div className="mb-2">
                    🎯 <strong>Objetivo:</strong> Clasificar entre los mejores 4 equipos
                  </div>
                  <div className="mb-2">
                    ⏱️ <strong>Duración:</strong> 7 jornadas de competición
                  </div>
                  <div>
                    📊 <strong>Sistema:</strong> 3 puntos por victoria, 1 por empate
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/5 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-primary text-2xl font-black">36</div>
                        <div className="text-muted-foreground font-medium">Total Partidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-primary text-2xl font-black">8</div>
                        <div className="text-muted-foreground font-medium">Por Equipo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 - Playoffs */}
            <div className="group from-background via-background relative overflow-hidden rounded-2xl border-2 border-orange-500/10 bg-gradient-to-br to-orange-500/5 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/30 hover:shadow-xl">
              {/* Decorative element */}
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 transition-transform duration-500 group-hover:scale-110" />

              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-xl font-black text-white shadow-lg">
                      02
                    </div>
                    <div>
                      <h3 className="text-foreground text-2xl leading-tight font-black">FASE</h3>
                      <h4 className="text-2xl leading-tight font-black text-orange-500">PLAYOFFS</h4>
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">🔥</div>
                </div>

                <p className="text-muted-foreground mb-4 text-base leading-relaxed font-medium">
                  La fase más intensa del torneo. Eliminación directa donde cada partido define destinos y solo los más
                  preparados avanzan.
                </p>

                <div className="text-muted-foreground mb-4 text-sm">
                  <div className="mb-2">
                    🎯 <strong>Semifinales:</strong> 1° vs 4° | 2° vs 3°
                  </div>
                  <div className="mb-2">
                    🔥 <strong>Intensidad:</strong> Un error puede significar eliminación
                  </div>
                  <div>
                    ⚡ <strong>Formato:</strong> Partido único, sin tiempo extra
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-orange-500/5 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-black text-orange-500">2</div>
                        <div className="text-muted-foreground font-medium">Semifinales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-orange-500">2</div>
                        <div className="text-muted-foreground font-medium">Finalistas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 - Final */}
            <div className="group from-background via-background relative overflow-hidden rounded-2xl border-2 border-yellow-500/20 bg-gradient-to-br to-yellow-500/10 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500/40 hover:shadow-xl md:col-span-2 lg:col-span-1">
              {/* Decorative element */}
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-500/10 transition-transform duration-500 group-hover:scale-110" />

              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-xl font-black text-white shadow-lg">
                      03
                    </div>
                    <div>
                      <h3 className="text-foreground text-2xl leading-tight font-black">GRAN</h3>
                      <h4 className="text-2xl leading-tight font-black text-yellow-500">FINAL</h4>
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">👑</div>
                </div>

                <p className="text-muted-foreground mb-4 text-base leading-relaxed font-medium">
                  El momento más esperado del año académico. Dos equipos que han demostrado ser los mejores luchan por
                  la gloria eterna en Major League UC.
                </p>

                <div className="text-muted-foreground mb-4 text-sm">
                  <div className="mb-2">
                    👑 <strong>Premio:</strong> Copa de Campeón Major League UC
                  </div>
                  <div className="mb-2">
                    🎖️ <strong>Reconocimiento:</strong> Nombres grabados en historia
                  </div>
                  <div>
                    🏆 <strong>Legado:</strong> Honor hasta la próxima temporada
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-black text-yellow-500">90&apos;</div>
                        <div className="text-muted-foreground font-medium">Minutos Finales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-yellow-500">🏆</div>
                        <div className="text-muted-foreground font-medium">Un Campeón</div>
                      </div>
                    </div>
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
