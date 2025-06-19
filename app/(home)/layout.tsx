import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Major League",
  description: "Descubre los próximos partidos de la Major League",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
