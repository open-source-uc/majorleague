import Link from "next/link";

import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  type?: "desktop" | "mobile";
  onClick?: () => void;
}

export default function NavLink({ href, children, className = "", type, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`text-md z-50 font-bold tracking-normal ${className} hover:text-primary-darken transition-colors duration-100`}
      onClick={() => {
        if (type === "mobile" && onClick) {
          onClick();
        }
      }}
    >
      {children}
    </Link>
  );
}
