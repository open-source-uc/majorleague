import Image from "next/image";

import caiLogo from "@/../public/assets/caiLogo.png";
import osucLogo from "@/../public/assets/osucLogo.png";
import ucLogo from "@/../public/assets/ucLogo.svg";

export default function Sponsors() {
  return (
    <section className="bg-background/50 border-t border-border/30 px-5 py-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Sponsors de la Liga
        </h2>
        <div className="flex items-center justify-center gap-12 md:gap-16">
          <a 
            href="https://www.uc.cl/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <Image src={ucLogo} alt="UC Logo" loading="lazy" className="h-12 w-auto md:h-10" />
          </a>
          <a 
            href="https://cai.cl/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <Image src={caiLogo} alt="CAI Logo" loading="lazy" className="h-12 w-auto md:h-8" />
          </a>
          <a 
            href="https://osuc.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <Image src={osucLogo} alt="OSUC Logo" loading="lazy" className="h-8 w-auto md:h-10" />
          </a>
        </div>
      </div>
    </section>
  );
}
