import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import logo from "@/public/assets/logo-vertical.svg";
import linkedin from "@/public/assets/linkedin.svg";
import youtube from "@/public/assets/youtube.svg";
import instagram from "@/public/assets/instagram.svg";

function Footer() {
  return (
    <div className="mx-auto mt-10 flex max-w-screen-lg flex-col justify-center gap-3 p-10">
      <div className="border-border-header flex w-full justify-between border-t px-0 py-10">
        <Link href="/" className="pr-8">
          <Image src={logo} alt="logo" priority />
        </Link>
        <div className="flex flex-col items-start gap-5">
          <p className="text-md text-primary-darken font-bold">INICIATIVA</p>
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-md tracking-normal">
              Equipos
            </Link>
            <Link href="/" className="text-md tracking-normal">
              Tabla de posiciones
            </Link>
            <Link href="/" className="text-md tracking-normal">
              Acerca de la Major League
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-start gap-5">
          <p className="text-md text-primary-darken font-bold">Contacto</p>
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-md tracking-normal">
              Únete al equipo de la Major League
            </Link>
            <Link href="/" className="text-md tracking-normal">
              Se sponsor de la Major League
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-start gap-5 pr-8">
          <p className="text-md text-primary-darken font-bold">INFORMACIÓN</p>
          <div className="flex flex-col gap-2">
            <p className="text-md tracking-normal">major@uc.cl</p>
          </div>
        </div>
        <div className="border-foreground flex flex-col items-start justify-center gap-5 border-l px-8 py-0">
          <p className="text-md font-bold">SIGUENOS EN</p>
          <div className="flex items-start gap-5">
            <Link href="https://www.linkedin.com/company/">
              <Image src={linkedin} alt="linkedin" />
            </Link>
            <Link href="https://www.youtube.com/">
              <Image src={youtube} alt="youtube" />
            </Link>
            <Link href="https://www.instagram.com/">
              <Image src={instagram} alt="instagram" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Footer);
