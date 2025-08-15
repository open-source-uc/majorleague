import Image from "next/image";

import hero from "@/../public/assets/images/hero.webp";

import NextMatches from "../home/NextMatches";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative py-8 w-full overflow-hidden bg-gradient-to-br from-background via-card to-background">
      {/* Dynamic background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent blur-3xl"></div>
      </div>
      
      {/* Main content grid */}
      <div className="relative z-10 flex py-8 items-center px-4 tablet:px-8 desktop:px-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 tablet:grid-cols-2 tablet:gap-40">
          
          {/* Left side - Typography */}
          <div className="relative space-y-8">
            
            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-6xl font-black uppercase leading-none tracking-tight text-foreground tablet:text-7xl desktop:text-8xl">
                <span className="block">VIVE</span>
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  EL FÚTBOL
                </span>
                <span className="block text-primary">EN LA UC</span>
              </h1>
              
              {/* Subheadline */}
              <p className="max-w-xl text-lg font-medium text-foreground tablet:text-xl">
                Únete a la comunidad de fútbol más apasionada de la UC. 
                <span className="text-primary font-bold"> Compite, conecta, conquista.</span>
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 desktop:flex-row desktop:gap-6">
              <Button size="lg" className="uppercase tracking-wide" href="/login">
                Únete Ahora
              </Button>
              <Button variant="outline" size="lg" className="uppercase tracking-wide" href="/equipos">
                Ver Equipos
              </Button>
            </div>
            
          </div>
          
          {/* Right side - Image and matches */}
          <div className="relative flex flex-col items-center gap-8 tablet:items-end">
            {/* Hero image with athletic styling */}
            <div className="relative group w-full">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-lg blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative overflow-hidden rounded-lg border border-border backdrop-blur-sm">
                <Image
                  src={hero}
                  alt="Major League UC - Comunidad de fútbol"
                  className="h-96 object-cover transition-transform duration-700 group-hover:scale-105 desktop:h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
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
