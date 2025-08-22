import Link from "next/link";

import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  type?: "desktop" | "mobile";
  onClick?: () => void;
  role?: string;
}

export default function NavLink({ href, children, className = "", type, onClick, role }: NavLinkProps) {
  const baseClasses = `text-md z-50 font-bold tracking-normal transition-all duration-200 ease-in-out hover:text-primary focus:outline-none ${className}`;

  // For desktop links (Server Component), no onClick handler
  if (type === "desktop") {
    return (
      <Link
        href={href}
        className={baseClasses}
        role={role}
        aria-label={typeof children === "string" ? `Navegar a ${children.toLowerCase()}` : undefined}
      >
        {children}
      </Link>
    );
  }

  // For mobile links (Client Component), include onClick handler
  return (
    <Link
      href={href}
      className={baseClasses}
      role={role}
      onClick={() => {
        if (type === "mobile" && onClick) {
          onClick();
        }
      }}
      aria-label={typeof children === "string" ? `Navegar a ${children.toLowerCase()}` : undefined}
    >
      {children}
    </Link>
  );
}
