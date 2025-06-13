import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import logo from "@/public/assets/logo-horizontal.svg";

function Navbar() {
  return (
    <header className="border-border-header flex items-center justify-between border-t border-b p-10">
      <Link className="border-foreground h-14 w-44 border-r" href="/">
        <Image
          src={logo}
          alt="logo"
          priority
          sizes="176px"
          className="h-full w-full object-contain"
          style={{ height: "56px", width: "176px" }}
        />
      </Link>
      <nav className="flex-1 px-6">
        <ul className="flex gap-6">
          <li>
            <Link href="/" className="text-md font-bold tracking-normal">
              EQUIPOS
            </Link>
          </li>
          <li>
            <Link href="/" className="text-md font-bold tracking-normal">
              TABLA DE POSICIONES
            </Link>
          </li>
          <li>
            <Link href="/" className="text-md font-bold tracking-normal">
              ACERCA
            </Link>
          </li>
        </ul>
      </nav>
      <Link
        href="/register?from=participa"
        className="text-primary text-md border-primary rounded-md border-2 border-solid px-4 py-2 font-bold tracking-normal"
      >
        PARTICIPA EN LA LIGA
      </Link>
    </header>
  );
}

export default memo(Navbar);
