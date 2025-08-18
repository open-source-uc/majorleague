import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import instagram from "@/../public/assets/instagram.svg";
import logo from "@/../public/assets/logo-vertical.svg";
import youtube from "@/../public/assets/youtube.svg";

import FooterCol from "./FooterCol";

function Footer() {
  const linkStyle = "text-sm md:text-md tracking-normal";
  const linkStyleHover = "hover:text-primary-darken transition-colors duration-100";
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  return (
    <footer className="bg-background border-border-header w-full border-t">
      <div className="mx-auto max-w-7xl px-5 py-15 md:px-10 lg:px-15">
        {/* Mobile Logo - Show at top on mobile and tablet */}
        <div className="mb-8 flex justify-center lg:hidden">
          <Link href="/">
            <Image src={logo} alt="Major League Logo" className="h-20 w-auto" priority />
          </Link>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* Desktop Logo - Show on left side on desktop */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <Link href="/">
              <Image src={logo} alt="Major League Logo" className="h-20 w-auto" priority />
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="mx-auto flex-1 lg:px-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              <FooterCol title="INICIATIVA">
                <Link href="/equipos" className={`${linkStyle} ${linkStyleHover}`}>
                  Equipos
                </Link>
                <Link href={`/posiciones/${year}/${semester}`} className={`${linkStyle} ${linkStyleHover}`}>
                  Tabla de posiciones
                </Link>
                <Link href="/acerca" className={`${linkStyle} ${linkStyleHover}`}>
                  Acerca de la Major League
                </Link>
              </FooterCol>

              <FooterCol title="CONTACTO">
                <Link href="/participa" className={`${linkStyle} ${linkStyleHover}`}>
                  Únete al equipo de la Major League
                </Link>
                <Link href="/participa" className={`${linkStyle} ${linkStyleHover}`}>
                  Sé sponsor de la Major League
                </Link>
              </FooterCol>

              <FooterCol title="INFORMACIÓN">
                <a href="mailto:major@uc.cl" className={`${linkStyle} ${linkStyleHover}`}>
                  major@uc.cl
                </a>
              </FooterCol>

              {/* Social Media Section */}
              <div className="sm:col-span-2 lg:col-span-1">
                <FooterCol title="SÍGUENOS EN">
                  <div className="flex gap-4">
                    <a
                      href="https://www.youtube.com/watch?v=0ewCq6rPgrI&list=PLKjWaWKhKm7qBGB_zrWmdkJ88UifQH_87"
                      className="group transition-transform duration-100 hover:scale-110"
                      aria-label="YouTube"
                    >
                      <Image
                        src={youtube}
                        alt="YouTube"
                        width={32}
                        className="transition-opacity duration-100 group-hover:opacity-80"
                        priority
                      />
                    </a>
                    <a
                      href="https://www.instagram.com/major_league_uc/"
                      className="group transition-transform duration-100 hover:scale-110"
                      aria-label="Instagram"
                    >
                      <Image
                        src={instagram}
                        alt="Instagram"
                        width={32}
                        className="transition-opacity duration-100 group-hover:opacity-80"
                        priority
                      />
                    </a>
                  </div>
                </FooterCol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
