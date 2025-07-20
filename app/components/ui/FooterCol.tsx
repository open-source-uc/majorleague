import { ReactNode } from "react";

interface FooterColProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function FooterCol({ title, children, className = "" }: FooterColProps) {
  return (
    <div
      className={`[&>p:first-child]:text-md [&>p:first-child]:text-primary-darken flex flex-col items-start gap-3 [&>p:first-child]:pb-3 [&>p:first-child]:font-bold ${className}`}
    >
      <p>{title}</p>
      {children}
    </div>
  );
}
