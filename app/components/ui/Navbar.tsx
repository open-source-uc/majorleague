import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import logoMajor from "@/../public/assets/logo-horizontal.svg";
import { getAuthStatus } from "@/lib/services/auth";

import Button from "./Button";
import NavbarClient from "./NavbarClient";
import NavLink from "./NavLink";

export const runtime = "edge";

async function Navbar() {
  const { isAuthenticated } = await getAuthStatus();
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  return (
    <header className="bg-background border-border border-b z-10 flex h-28 items-center justify-between p-10">
      <Link 
        className="border-foreground tablet:border-r focus:outline-none focus:ring-2 focus:ring-ring focus:rounded-sm" 
        href="/"
        aria-label="Ir a la página principal"
      >
        <Image
          src={logoMajor}
          alt="Major League - Logotipo principal"
          priority
          className="h-10 w-30 object-contain min-[470px]:h-14 min-[470px]:w-44"
        />
      </Link>
      <nav 
        className="hidden flex-1 px-6 tablet:block"
        aria-label="Navegación principal"
      >
        <ul className="flex gap-6" role="menubar">
          <li role="none">
            <NavLink href="/equipos" type="desktop" role="menuitem">
              EQUIPOS
            </NavLink>
          </li>
          <li role="none">
            <NavLink href="/torneo" type="desktop" role="menuitem">
              TORNEO
            </NavLink>
          </li>
          <li role="none">
            <NavLink href={`/posiciones/${year}/${semester}`} type="desktop" role="menuitem">
              TABLA DE POSICIONES
            </NavLink>
          </li>
          {/* <li role="none">
            <NavLink href="/acerca" type="desktop" role="menuitem">
              ACERCA
            </NavLink>
          </li> */}
        </ul>
      </nav>

      {/* Desktop Auth Button */}
      {isAuthenticated ? (
        <Button
          href="/perfil"
          variant="outline"
          size="sm"
          className="hidden tablet:inline-flex"
          aria-label="Ir a tu perfil de usuario"
        >
          TU PERFIL
        </Button>
      ) : (
        <Button
          href="/login"
          variant="outline"
          size="sm"
          className="hidden tablet:inline-flex"
          aria-label="Iniciar sesión en tu cuenta"
        >
          JUEGA POR LA LIGA
        </Button>
      )}

      {/* Mobile Menu - Client Component */}
      <NavbarClient isAuthenticated={isAuthenticated} />
    </header>
  );
}

export default memo(Navbar);
