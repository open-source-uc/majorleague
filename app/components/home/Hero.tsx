import Image from "next/image";

import hero from "@/public/assets/hero.png";

import NextMatches from "../home/NextMatches";

export default function Hero() {
  return (
    <section className="bg-primary flex h-max w-full flex-col items-center justify-between gap-20 px-0 md:flex-row md:px-10">
      <div className="relative block h-max overflow-hidden">
        <h1 className="text-7xl font-bold text-black lg:text-9xl">
          VIVE EL <br className="md:hidden" />
          FUTBOL <br />
          EN <br className="md:hidden" />
          LA <br />
          UC
        </h1>
        <Image
          src={hero}
          alt="Major League UC - Comunidad de fútbol"
          className="xl:size-100% absolute right-0 bottom-0 size-[80%] rounded-lg object-cover xl:object-none"
        />
      </div>
      <div className="py-3">
        <NextMatches />
      </div>
    </section>
  );
}
