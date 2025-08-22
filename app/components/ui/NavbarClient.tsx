"use client";

import Image from "next/image";

import { useEffect, useRef, useState } from "react";

// Si se usa este icono, hay que añadir enlace en el footer https://iconos8.es/license
import menuIcon from "@/../public/assets/menu-iconos8.svg";

import Button from "./Button";
import NavLink from "./NavLink";

interface NavbarClientProps {
  isAuthenticated: boolean;
}

export default function NavbarClient({ isAuthenticated }: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const date = new Date();
  const year = date.getFullYear();
  const semester = date.getMonth() < 7 ? 1 : 2;

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="hover:bg-accent tablet:hidden rounded-sm p-2 transition-colors duration-200 ease-in-out focus:outline-none"
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
      >
        <Image src={menuIcon} alt="" className="size-8" />
      </button>

      <div
        ref={menuRef}
        id="mobile-menu"
        className={`bg-background border-border fixed top-28 left-0 z-[9999] w-full transform flex-col items-center gap-6 border-b py-6 text-lg shadow-lg duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "flex translate-y-0 opacity-100" : "hidden -translate-y-2 opacity-0"
        }`}
        role="menu"
        aria-labelledby="mobile-menu-button"
      >
        <nav aria-label="Navegación móvil">
          <ul className="flex flex-col items-center gap-6" role="menubar">
            <li role="none">
              <NavLink href="/equipos" type="mobile" onClick={closeMenu} role="menuitem">
                EQUIPOS
              </NavLink>
            </li>
            <li role="none">
              <NavLink href="/torneo" type="mobile" onClick={closeMenu} role="menuitem">
                TORNEO
              </NavLink>
            </li>
            <li role="none">
              <NavLink href={`/transmisiones`} type="mobile" onClick={closeMenu} role="menuitem">
                TRANSMISIONES
              </NavLink>
            </li>
            <li role="none">
              <NavLink href={`/posiciones/${year}/${semester}`} type="mobile" onClick={closeMenu} role="menuitem">
                TABLA DE POSICIONES
              </NavLink>
            </li>
            {/* <li role="none">
              <NavLink 
                href="/acerca" 
                type="mobile" 
                onClick={closeMenu}
                role="menuitem"
              >
                ACERCA
              </NavLink>
            </li> */}
            <li role="none">
              {isAuthenticated ? (
                <div onClick={closeMenu}>
                  <Button
                    href="/perfil"
                    variant="outline"
                    size="md"
                    className="px-10"
                    role="menuitem"
                    aria-label="Ir a tu perfil de usuario"
                  >
                    TU PERFIL
                  </Button>
                </div>
              ) : (
                <div onClick={closeMenu}>
                  <Button
                    href="/login"
                    variant="outline"
                    size="md"
                    className="px-10"
                    role="menuitem"
                    aria-label="Iniciar sesión en tu cuenta"
                  >
                    INGRESAR
                  </Button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
