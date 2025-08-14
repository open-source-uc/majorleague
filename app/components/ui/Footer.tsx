import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import instagram from "@/../public/assets/instagram.svg";
import linkedin from "@/../public/assets/linkedin.svg";
import logo from "@/../public/assets/logo-vertical.svg";
import youtube from "@/../public/assets/youtube.svg";

import FooterCol from "./FooterCol";

function Footer() {
  const linkStyle = "text-sm tablet:text-md tracking-normal";
  const linkStyleHover = "hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors duration-100 rounded-sm";
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  return (
    <footer className="bg-background border-border-header w-full border-t" role="contentinfo">
      <div className="mx-auto max-w-7xl px-5 py-15 tablet:px-10 desktop:px-15">

        <div className="flex flex-col gap-10 tablet:flex-row tablet:justify-between">
          {/* Desktop Logo - Show on left side on desktop */}
          <div className="hidden tablet:flex tablet:flex-shrink-0">
            <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm">
              <Image src={logo} alt="Major League Logo" className="h-20 w-auto" priority />
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="mx-auto flex-1 tablet:px-10">
            {/* Mobile Logo - Show at top on mobile and tablet */}
            <div className="mb-8 flex justify-left tablet:hidden">
              <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm">
                <Image src={logo} alt="Major League Logo" className="h-20 w-auto" priority />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 tablet:grid-cols-4">
              <FooterCol title="INICIATIVA">
                <nav aria-label="Iniciativa navigation">
                  <ul className="flex flex-col gap-2">
                    <li>
                      <Link href="/equipos" className={`${linkStyle} ${linkStyleHover}`}>
                        Equipos
                      </Link>
                    </li>
                    <li>
                      <Link href={`/posiciones/${year}/${semester}`} className={`${linkStyle} ${linkStyleHover}`}>
                        Tabla de posiciones
                      </Link>
                    </li>
                    <li>
                      <Link href="/acerca" className={`${linkStyle} ${linkStyleHover}`}>
                        Acerca de la Major League
                      </Link>
                    </li>
                  </ul>
                </nav>
              </FooterCol>

              <FooterCol title="CONTACTO">
                <nav aria-label="Contacto navigation">
                  <ul className="flex flex-col gap-2">
                    <li>
                      <Link href="/participa" className={`${linkStyle} ${linkStyleHover}`}>
                        Únete al equipo de la Major League
                      </Link>
                    </li>
                    <li>
                      <Link href="/participa" className={`${linkStyle} ${linkStyleHover}`}>
                        Sé sponsor de la Major League
                      </Link>
                    </li>
                  </ul>
                </nav>
              </FooterCol>

              <FooterCol title="INFORMACIÓN">
                <nav aria-label="Información navigation">
                  <ul className="flex flex-col gap-2">
                    <li>
                      <a href="mailto:major@uc.cl" className={`${linkStyle} ${linkStyleHover}`}>
                        major@uc.cl
                      </a>
                    </li>
                  </ul>
                </nav>
              </FooterCol>

              {/* Social Media Section */}
              <FooterCol title="SÍGUENOS EN">
                <nav aria-label="Redes sociales">
                  <ul className="flex gap-4" role="list">
                    <li>
                      <a
                        href="https://www.linkedin.com/company/"
                        className="group transition-transform duration-100 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                        aria-label="Síguenos en LinkedIn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={linkedin}
                          alt=""
                          className="size-8 transition-opacity duration-100 group-hover:opacity-80 group-focus:opacity-80"
                          priority
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.youtube.com/"
                        className="group transition-transform duration-100 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                        aria-label="Síguenos en YouTube"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={youtube}
                          alt=""
                          className="size-8 transition-opacity duration-100 group-hover:opacity-80 group-focus:opacity-80"
                          priority
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/"
                        className="group transition-transform duration-100 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                        aria-label="Síguenos en Instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={instagram}
                          alt=""
                          className="size-8 transition-opacity duration-100 group-hover:opacity-80 group-focus:opacity-80"
                          priority
                        />
                      </a>
                    </li>
                  </ul>
                </nav>
              </FooterCol>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
