import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import logoMajor from "@/../public/assets/logo-horizontal.svg";
import { getAuthStatus } from "@/lib/services/auth";

import NavbarClient from "./NavbarClient";
import NavLink from "./NavLink";

export const runtime = "edge";

async function Navbar() {
  const { isAuthenticated } = await getAuthStatus();
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  return (
    <header className="bg-background border-border-header z-1 flex h-32 items-center justify-between border-b p-10">
      <Link className="border-foreground lg:border-r" href="/">
        <Image
          src={logoMajor}
          alt="Major League Logo"
          priority
          className="h-10 w-30 object-contain min-[470px]:h-14 min-[470px]:w-44"
        />
      </Link>
      <nav className="hidden flex-1 px-6 lg:block">
        <ul className="flex gap-6">
          <li>
            <NavLink href="/equipos" type="desktop">
              EQUIPOS
            </NavLink>
          </li>
          <li>
            <NavLink href={`/posiciones/${year}/${semester}`} type="desktop">
              TABLA DE POSICIONES
            </NavLink>
          </li>
          {/* <li>
            <NavLink href="/acerca" type="desktop">
              ACERCA
            </NavLink>
          </li> */}
        </ul>
      </nav>

      {/* Desktop Auth Button */}
      {isAuthenticated ? (
        <Link
          href="/perfil"
          className="text-primary-darken text-md border-primary-darken hover:text-primary hover:border-primary hidden rounded-md border-2 border-solid px-4 py-2 font-bold tracking-normal transition-colors lg:inline"
        >
          TU PERFIL
        </Link>
      ) : (
        <Link
          href="/login"
          className="text-primary-darken text-md border-primary-darken hover:text-primary hover:border-primary hidden rounded-md border-2 border-solid px-4 py-2 font-bold tracking-normal transition-colors lg:inline"
        >
          INGRESAR
        </Link>
      )}

      {/* Mobile Menu - Client Component */}
      <NavbarClient isAuthenticated={isAuthenticated} />
    </header>
  );
}

export default memo(Navbar);
