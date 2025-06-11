import Image from "next/image";

import hero from "@/public/assets/hero.png";

import NextMatches from "../home/NextMatches";

export default function Hero() {
  return (
    <div className="bg-primary flex items-center justify-between gap-20 px-10 py-3">
      <div>
        <Image src={hero} alt="hero" priority sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div>
        <NextMatches />
      </div>
    </div>
  );
}
