import { ReactNode } from "react";

interface FooterColProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function FooterCol({ title, children, className = "" }: FooterColProps) {
  return (
    <div className={`flex flex-col items-start gap-3 ${className}`}>
      <h3 className="text-md text-primary-darken pb-3 font-bold">{title}</h3>
      {children}
    </div>
  );
}
