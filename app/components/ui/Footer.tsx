import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import logo from "@/../public/assets/logo-horizontal.svg";

function Footer() {
  const currentYear = new Date().getFullYear();
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  return (
    <footer className="bg-background border-border-header w-full border-t" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Mobile Layout */}
        <div className="text-muted-foreground flex flex-col items-center space-y-4 text-sm md:hidden">
          {/* Logo centered */}
          <Link
            href="/"
            className="focus:ring-ring focus:ring-offset-background rounded-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Image src={logo} alt="Major League UC Logo" className="h-12 w-auto" priority />
          </Link>

          {/* Links in grid layout */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-center">
            <Link href="/torneo" className="hover:text-foreground transition-colors">
              Torneo
            </Link>
            <Link href="/equipos" className="hover:text-foreground transition-colors">
              Equipos
            </Link>
            <Link href={`/posiciones/${year}/${semester}`} className="hover:text-foreground transition-colors">
              Posiciones
            </Link>
            <Link href="/transmisiones" className="hover:text-foreground transition-colors">
              Transmisiones
            </Link>
            <Link href="/participa" className="hover:text-foreground transition-colors">
              Participar
            </Link>
            <a
              href="https://www.instagram.com/major_league_uc/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="text-muted-foreground hidden flex-wrap items-center justify-between gap-4 text-sm md:flex">
          {/* Logo on the left */}
          <Link
            href="/"
            className="focus:ring-ring focus:ring-offset-background rounded-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Image src={logo} alt="Major League UC Logo" className="h-8 w-auto" priority />
          </Link>

          {/* Links in the center/right */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="text-xs">© {currentYear} Major League UC</span>
            <Link href="/torneo" className="hover:text-foreground transition-colors">
              Torneo
            </Link>
            <Link href="/equipos" className="hover:text-foreground transition-colors">
              Equipos
            </Link>
            <Link href={`/posiciones/${year}/${semester}`} className="hover:text-foreground transition-colors">
              Posiciones
            </Link>
            <Link href="/transmisiones" className="hover:text-foreground transition-colors">
              Transmisiones
            </Link>
            <Link href="/participa" className="hover:text-foreground transition-colors">
              Participar
            </Link>
            <a
              href="https://www.instagram.com/major_league_uc/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
