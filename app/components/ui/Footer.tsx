import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import instagram from "@/public/assets/instagram.svg";
import linkedin from "@/public/assets/linkedin.svg";
import logo from "@/public/assets/logo-vertical.svg";
import youtube from "@/public/assets/youtube.svg";

import FooterCol from "./FooterCol";

function Footer() {
  const linkStyle = "text-sm md:text-md tracking-normal";
  const linkStyleHover = "hover:text-primary-darken transition-colors";

  return (
    <footer className="border-border-header flex w-full justify-between border-t px-5 py-10 md:px-15">
      <Link href="/" className="hidden md:block">
        <Image src={logo} alt="logo" priority />
      </Link>

      <div className="grid flex-1 grid-cols-2 gap-10 sm:px-5 md:grid-cols-3 md:px-40 lg:grid-cols-4">
        <FooterCol title="INICIATIVA">
          <Link href="/" className={`${linkStyle} ${linkStyleHover}`}>
            Equipos
          </Link>
          <Link href="/" className={`${linkStyle} ${linkStyleHover}`}>
            Tabla de posiciones
          </Link>
          <Link href="/" className={`${linkStyle} ${linkStyleHover}`}>
            Acerca de la Major League
          </Link>
        </FooterCol>
        <FooterCol title="CONTACTO">
          <Link href="/" className={`${linkStyle} ${linkStyleHover} break-words`}>
            Únete al equipo de la Major League
          </Link>
          <Link href="/" className={`${linkStyle} ${linkStyleHover} break-words`}>
            Se sponsor de la Major League
          </Link>
        </FooterCol>
        <FooterCol title="INFORMACIÓN">
          <p className={`${linkStyle}`}>major@uc.cl</p>
        </FooterCol>
        <div className="border-foreground flex flex-col items-start justify-center gap-5 border-l px-8 py-0">
          <p className="text-md font-bold">SIGUENOS EN</p>
          <div className="flex items-start gap-5">
            <a href="https://www.linkedin.com/company/" className="size-10">
              <Image src={linkedin} alt="LinkedIn" className="size-10 hover:!text-[#0077B5]" priority />
            </a>
            <a href="https://www.youtube.com/">
              <Image src={youtube} alt="YouTube" className="size-10 fill-red-700" priority />
            </a>
            <a href="https://www.instagram.com/">
              <Image src={instagram} alt="instagram" className="size-10" priority />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
