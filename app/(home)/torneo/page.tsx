export const runtime = "edge";

export default function TorneoPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-background min-h-[70vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,165,0,0.2),transparent)]" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-primary/10 blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-24 w-24 rounded-full bg-yellow-500/10 blur-xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-orange-500/10 blur-xl animate-pulse" style={{animationDelay: '2s'}} />
        
        <div className="relative px-5 py-20 w-full">
          <div className="mx-auto max-w-5xl text-center">
            {/* Championship Badge */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 backdrop-blur-sm border border-yellow-500/30">
                <div className="text-6xl">🏆</div>
              </div>
            </div>
            
            <h1 className="mb-8 text-6xl font-black tracking-tight text-foreground tablet:text-7xl desktop:text-8xl leading-none">
              <span className="block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">EL TORNEO</span>
              <span className="block bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent mt-2">DE MAJORS</span>
              <span className="block text-2xl font-bold text-muted-foreground mt-4 tracking-wide">2025 • TEMPORADA 2</span>
            </h1>
            
            <p className="mx-auto max-w-3xl text-xl text-foreground/90 leading-relaxed font-medium mb-8">
              La competición más prestigiosa de la ingeniería UC. Nueve equipos, una pasión, un sueño: 
              <strong className="text-primary"> ser campeones de Major League</strong>.
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚽</span>
                <span>9 Equipos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span>36 Partidos</span>
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
      <section className="px-5 py-20 bg-gradient-to-br from-background via-primary/5 to-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent)]" />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-16 tablet:grid-cols-2 tablet:items-center">
            <div>
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                  <span>🏆</span> MAJOR LEAGUE UC
                </div>
                <h2 className="mb-6 text-4xl font-black text-foreground leading-tight">
                  UNA LIGA,<br />
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">MÚLTIPLES</span><br />
                  <span className="text-primary">ESPECIALIDADES</span>
                </h2>
              </div>
              
              <p className="mb-8 text-lg text-foreground/90 leading-relaxed font-medium">
                Cada equipo representa la excelencia académica trasladada al terreno de juego. La precisión de <strong>Ingeniería Civil</strong>, la innovación de <strong>Computación</strong>, la tradición de los <strong>Old Boys</strong> y el entusiasmo de los <strong>New Boys</strong>.
              </p>
              
              {/* Achievement Icons */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-primary/5 p-4">
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="text-sm font-bold text-foreground">Excelencia</div>
                  <div className="text-xs text-muted-foreground">Académica</div>
                </div>
                <div className="rounded-xl bg-primary/5 p-4">
                  <div className="text-2xl mb-2">⚽</div>
                  <div className="text-sm font-bold text-foreground">Pasión</div>
                  <div className="text-xs text-muted-foreground">Deportiva</div>
                </div>
                <div className="rounded-xl bg-primary/5 p-4">
                  <div className="text-2xl mb-2">🤝</div>
                  <div className="text-sm font-bold text-foreground">Espíritu</div>
                  <div className="text-xs text-muted-foreground">Competitivo</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Floating decoration */}
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-orange-500/10 blur-2xl" />
              
              <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-background/95 p-8 shadow-2xl backdrop-blur-sm">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5" />
                
                <div className="relative">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white">
                      <span className="text-xl">🏟️</span>
                    </div>
                    <h3 className="text-2xl font-black text-foreground">TEMPORADA ACTUAL</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="rounded-xl bg-primary/5 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground font-medium">Formato</span>
                        <span className="font-black text-foreground text-lg">Liga + Playoffs</span>
                      </div>
                      <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/80 w-3/4 rounded-full" />
                      </div>
                    </div>
                    
                    <div className="rounded-xl bg-orange-500/5 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground font-medium">Sistema</span>
                        <span className="font-black text-foreground text-lg">Todos vs Todos</span>
                      </div>
                      <div className="h-1 bg-orange-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 w-full rounded-full" />
                      </div>
                    </div>
                    
                    <div className="rounded-xl bg-yellow-500/10 p-4 border border-yellow-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground font-medium">Período</span>
                        <span className="font-black text-yellow-600 text-xl">2025-2</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">Segundo semestre académico</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Format Section */}
      <section className="px-5 py-20 bg-gradient-to-br from-background via-background to-primary/5 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,165,0,0.1),transparent)]" />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-orange-500/10 px-6 py-3 text-sm font-bold text-primary border border-primary/20">
              <span>⚡</span> ESTRUCTURA DE COMPETICIÓN
            </div>
            <h2 className="mb-6 text-5xl font-black text-foreground leading-tight">
              <span className="block">FORMATO DEL</span>
              <span className="block bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent">TORNEO</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground font-medium">
              Tres fases épicas que definirán al campeón de Major League UC 2025-2
            </p>
            <div className="mx-auto mt-6 h-2 w-32 bg-gradient-to-r from-primary via-orange-500 to-yellow-500 rounded-full" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Phase 1 - Group Stage */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-background via-background to-primary/5 p-8 shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-2">
              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 transition-transform duration-500 group-hover:scale-110" />
              
              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white font-black text-xl shadow-lg">
                      01
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-foreground leading-tight">FASE</h3>
                      <h4 className="text-2xl font-black text-primary leading-tight">REGULAR</h4>
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">⚽</div>
                </div>
                
                <p className="mb-4 text-base text-muted-foreground leading-relaxed font-medium">
                  Sistema de liga donde cada equipo enfrenta a todos los demás. La consistencia y regularidad definen a los equipos que merecen estar en playoffs.
                </p>
                
                <div className="mb-4 text-sm text-muted-foreground">
                  <div className="mb-2">🎯 <strong>Objetivo:</strong> Clasificar entre los mejores 4 equipos</div>
                  <div className="mb-2">⏱️ <strong>Duración:</strong> 9 jornadas de competición</div>
                  <div>📊 <strong>Sistema:</strong> 3 puntos por victoria, 1 por empate</div>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-xl bg-primary/5 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-black text-primary">36</div>
                        <div className="text-muted-foreground font-medium">Total Partidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-primary">8</div>
                        <div className="text-muted-foreground font-medium">Por Equipo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 - Playoffs */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-orange-500/10 bg-gradient-to-br from-background via-background to-orange-500/5 p-8 shadow-lg transition-all duration-300 hover:border-orange-500/30 hover:shadow-xl hover:-translate-y-2">
              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 transition-transform duration-500 group-hover:scale-110" />
              
              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-xl shadow-lg">
                      02
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-foreground leading-tight">FASE</h3>
                      <h4 className="text-2xl font-black text-orange-500 leading-tight">PLAYOFFS</h4>
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">🔥</div>
                </div>
                
                <p className="mb-4 text-base text-muted-foreground leading-relaxed font-medium">
                  La fase más intensa del torneo. Eliminación directa donde cada partido define destinos y solo los más preparados avanzan.
                </p>
                
                <div className="mb-4 text-sm text-muted-foreground">
                  <div className="mb-2">🎯 <strong>Semifinales:</strong> 1° vs 4° | 2° vs 3°</div>
                  <div className="mb-2">🔥 <strong>Intensidad:</strong> Un error puede significar eliminación</div>
                  <div>⚡ <strong>Formato:</strong> Partido único, sin tiempo extra</div>
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
            <div className="group relative overflow-hidden rounded-2xl border-2 border-yellow-500/20 bg-gradient-to-br from-background via-background to-yellow-500/10 p-8 shadow-lg transition-all duration-300 hover:border-yellow-500/40 hover:shadow-xl hover:-translate-y-2 md:col-span-2 lg:col-span-1">
              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-500/10 transition-transform duration-500 group-hover:scale-110" />
              
              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-black text-xl shadow-lg">
                      03
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-foreground leading-tight">GRAN</h3>
                      <h4 className="text-2xl font-black text-yellow-500 leading-tight">FINAL</h4>
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">👑</div>
                </div>
                
                <p className="mb-4 text-base text-muted-foreground leading-relaxed font-medium">
                  El momento más esperado del año académico. Dos equipos que han demostrado ser los mejores luchan por la gloria eterna en Major League UC.
                </p>
                
                <div className="mb-4 text-sm text-muted-foreground">
                  <div className="mb-2">👑 <strong>Premio:</strong> Copa de Campeón Major League UC</div>
                  <div className="mb-2">🎖️ <strong>Reconocimiento:</strong> Nombres grabados en historia</div>
                  <div>🏆 <strong>Legado:</strong> Honor hasta la próxima temporada</div>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-xl bg-yellow-500/10 p-4 border border-yellow-500/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-black text-yellow-500">90'</div>
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