"use client";

import Image from "next/image";
import Link from "next/link";

import { useState } from "react";

// Si se usa este icono, hay que añadir enlace en el footer https://iconos8.es/license
import menuIcon from "@/../public/assets/menu-iconos8.svg";

import NavLink from "./NavLink";

interface NavbarClientProps {
  isAuthenticated: boolean;
}

export default function NavbarClient({ isAuthenticated }: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  return (
    <>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="hover:cursor-pointer lg:hidden">
        <Image src={menuIcon} alt="Abrir menú" className="size-8" />
      </button>
      <div
        className={`bg-background absolute top-30 left-0 w-full transform flex-col items-center gap-6 py-6 text-lg duration-300 ease-in-out lg:hidden ${isMenuOpen ? "flex" : "hidden"}`}
      >
        <nav>
          <ul className="flex flex-col items-center gap-6">
            <li>
              <NavLink href="/equipos" type="mobile" onClick={() => setIsMenuOpen(false)}>
                EQUIPOS
              </NavLink>
            </li>
            <li>
              <NavLink href={`/posiciones/${year}/${semester}`} type="mobile" onClick={() => setIsMenuOpen(false)}>
                TABLA DE POSICIONES
              </NavLink>
            </li>
            {/* <li>
              <NavLink href="/acerca" type="mobile" onClick={() => setIsMenuOpen(false)}>
                ACERCA
              </NavLink>
            </li> */}
            <li>
              {isAuthenticated ? (
                <Link
                  href="/perfil"
                  className="text-primary-darken text-md border-primary-darken hover:text-primary hover:border-primary rounded-md border-2 border-solid px-10 py-2 font-bold tracking-normal transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  TU PERFIL
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-primary-darken text-md border-primary-darken hover:text-primary hover:border-primary rounded-md border-2 border-solid px-10 py-2 font-bold tracking-normal transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  INGRESAR
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
