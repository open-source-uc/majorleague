import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Major League",
  description: "Descubre los próximos partidos de la Major League",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-10 overflow-hidden">{children}</div>;
}
