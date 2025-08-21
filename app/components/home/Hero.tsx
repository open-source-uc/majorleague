import Image from "next/image";

import hero from "@/../public/assets/images/hero.webp";

import NextMatches from "../home/NextMatches";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="from-background via-card to-background relative w-full overflow-hidden bg-gradient-to-br py-8">
      {/* Dynamic background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="bg-primary absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full blur-3xl" />
      </div>

      {/* Main content grid */}
      <div className="tablet:px-8 desktop:px-12 relative z-10 flex items-center px-4 py-8">
        <div className="tablet:grid-cols-2 tablet:gap-40 grid w-full grid-cols-1 items-center gap-12">
          {/* Left side - Typography */}
          <div className="relative space-y-8">
            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-foreground tablet:text-7xl desktop:text-8xl text-6xl leading-none font-black tracking-tight uppercase">
                <span className="block">VIVE</span>
                <span className="from-primary to-accent block bg-gradient-to-r bg-clip-text text-transparent">
                  EL FÚTBOL
                </span>
                <span className="text-primary block">EN LA UC</span>
              </h1>

              {/* Subheadline */}
              <p className="text-foreground tablet:text-xl max-w-xl text-lg font-medium">
                Únete a la comunidad de fútbol más apasionada de la UC.
                <span className="text-primary font-bold"> Compite, conecta, conquista.</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="desktop:flex-row desktop:gap-6 flex flex-col gap-4">
              <Button size="lg" className="tracking-wide uppercase" href="/login">
                Únete Ahora
              </Button>
              <Button variant="outline" size="lg" className="tracking-wide uppercase" href="/equipos">
                Ver Equipos
              </Button>
            </div>
          </div>

          {/* Right side - Image and matches */}
          <div className="tablet:items-end relative flex flex-col items-center gap-8">
            {/* Hero image with athletic styling */}
            <div className="group relative w-full">
              <div className="from-primary to-accent absolute -inset-4 rounded-lg bg-gradient-to-r opacity-30 blur-xl transition-opacity duration-500 group-hover:opacity-50" />
              <div className="border-border relative overflow-hidden rounded-lg border backdrop-blur-sm">
                <Image
                  src={hero}
                  alt="Major League UC - Comunidad de fútbol"
                  className="desktop:h-80 h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  placeholder="blur"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>

            {/* Next matches section */}
            <div className="w-full">
              <NextMatches />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
