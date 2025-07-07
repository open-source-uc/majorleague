"use client";

import Image from "next/image";
import Link from "next/link";

import { memo, useState } from "react";

import logoMajor from "@/../public/assets/logo-horizontal.svg";
// Si se usa este icono, hay que añadir enlace en el footer https://iconos8.es/license
import menuIcon from "@/../public/assets/menu-iconos8.svg";

import NavLink from "./NavLink";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background border-border-header top-0 z-50 flex h-32 w-dvw items-center justify-between border-b p-10">
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
            <NavLink href="/" type="desktop">
              EQUIPOS
            </NavLink>
          </li>
          <li>
            <NavLink href="/posiciones/2025/1" type="desktop">
              TABLA DE POSICIONES
            </NavLink>
          </li>
          <li>
            <NavLink href="/" type="desktop">
              ACERCA
            </NavLink>
          </li>
        </ul>
      </nav>
      <Link
        href="/login"
        className="text-primary-darken text-md border-primary-darken hover:text-primary hover:border-primary hidden rounded-md border-2 border-solid px-4 py-2 font-bold tracking-normal transition-colors lg:inline"
      >
        INGRESAR
      </Link>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="hover:cursor-pointer lg:hidden">
        <Image src={menuIcon} alt="Abrir menú" className="size-8" />
      </button>
      <div
        className={`bg-background absolute top-30 left-0 w-full transform flex-col items-center gap-6 py-6 text-lg duration-300 ease-in-out lg:hidden ${isMenuOpen ? "flex" : "hidden"}`}
      >
        <nav>
          <ul className="flex flex-col items-center gap-6">
            <li>
              <NavLink href="/" type="mobile" onClick={() => setIsMenuOpen(false)}>
                EQUIPOS
              </NavLink>
            </li>
            <li>
              <NavLink href="/" type="mobile" onClick={() => setIsMenuOpen(false)}>
                TABLA DE POSICIONES
              </NavLink>
            </li>
            <li>
              <NavLink href="/" type="mobile" onClick={() => setIsMenuOpen(false)}>
                ACERCA
              </NavLink>
            </li>
            <li>
              <Link
                href="/register?from=participa"
                className="text-primary-darken text-md border-primary-darken hover:text-primary hover:border-primary rounded-md border-2 border-solid px-10 py-2 font-bold tracking-normal transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                PARTICIPA EN LA LIGA
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default memo(Navbar);
