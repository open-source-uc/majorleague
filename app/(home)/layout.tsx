import type { Metadata } from "next";

import ImagePreloader from "@/components/ui/ImagePreloader";

export const metadata: Metadata = {
  title: "Major League",
  description: "Descubre los próximos partidos de la Major League",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ImagePreloader 
        teamLogos={[
          "/assets/teams/AtleticoByteLogo.png",
          "/assets/teams/MathchesterScienceLogo.png",
          "/assets/teams/ManchesterCivilLogo.png",
          "/assets/teams/RobovoltUnitedLogo.png"
        ]}
        heroImages={["/assets/images/hero.webp"]}
      />
      {children}
    </>
  );
}
