"use client";

import Image from "next/image";
import Link from "next/link";

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
      if (event.key === 'Escape' && isMenuOpen) {
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

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
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
        className="hover:bg-accent p-2 rounded-sm transition-colors duration-200 ease-in-out tablet:hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
      >
        <Image src={menuIcon} alt="" className="size-8" />
      </button>
      
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`bg-background border-border border-b absolute top-32 left-0 w-full transform flex-col items-center gap-6 py-6 text-lg duration-300 ease-in-out lg:hidden shadow-lg ${
          isMenuOpen ? "flex opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-2"
        }`}
        role="menu"
        aria-labelledby="mobile-menu-button"
      >
        <nav aria-label="Navegación móvil">
          <ul className="flex flex-col items-center gap-6" role="menubar">
            <li role="none">
              <NavLink 
                href="/equipos" 
                type="mobile" 
                onClick={closeMenu}
                role="menuitem"
              >
                EQUIPOS
              </NavLink>
            </li>
            <li role="none">
              <NavLink 
                href={`/posiciones/${year}/${semester}`} 
                type="mobile" 
                onClick={closeMenu}
                role="menuitem"
              >
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
