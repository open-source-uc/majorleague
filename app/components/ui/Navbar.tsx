import Image from "next/image";
import Link from "next/link";

import { memo } from "react";

import logo from "@/public/assets/logo-horizontal.svg";

function Navbar() {
  return (
    <div className="border-border-header flex items-center justify-between border-t border-b p-10">
      <div className="flex items-center gap-8">
        <div className="border-foreground h-14 w-44 border-r">
          <Link href="/">
            <Image
              src={logo}
              alt="logo"
              priority
              sizes="176px"
              className="h-full w-full object-contain"
              style={{ height: "56px", width: "176px" }}
            />
          </Link>
        </div>
        <div className="flex gap-8">
          <Link href="/" className="text-md px-3 py-2 font-bold tracking-normal">
            EQUIPOS
          </Link>
          <Link href="/" className="text-md px-3 py-2 font-bold tracking-normal">
            TABLA DE POSICIONES
          </Link>
          <Link href="/" className="text-md px-3 py-2 font-bold tracking-normal">
            ACERCA
          </Link>
        </div>
      </div>
      <div className="bg-primary rounded-md px-4 py-2">
        <Link href="/register?from=participa" className="text-md text-background-header font-bold tracking-normal">
          PARTICIPA EN LA LIGA
        </Link>
      </div>
    </div>
  );
}

export default memo(Navbar);
