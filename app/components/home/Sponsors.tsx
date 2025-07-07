import Image from "next/image";

import caiLogo from "@/../public/assets/caiLogo.png";
import osucLogo from "@/../public/assets/osucLogo.png";
import ucLogo from "@/../public/assets/ucLogo.svg";

export default function Sponsors() {
  return (
    <section className="flex w-full flex-col items-center gap-2 py-3">
      <h2 className="text-md font-bold">SPONSORS DE LA LIGA</h2>
      <div className="flex w-full items-center justify-center gap-14 md:gap-24">
        <a href="https://www.uc.cl/" target="_blank" rel="noopener noreferrer">
          <Image src={ucLogo} alt="UC Logo" loading="lazy" className="h-auto w-20 md:w-28" />
        </a>
        <a href="https://cai.cl/" target="_blank" rel="noopener noreferrer">
          <Image src={caiLogo} alt="CAI Logo" loading="lazy" className="h-auto w-12 md:w-18" />
        </a>
        <a href="https://osuc.dev/" target="_blank" rel="noopener noreferrer">
          <Image src={osucLogo} alt="OSUC Logo" loading="lazy" className="h-auto w-20 md:w-22" />
        </a>
      </div>
    </section>
  );
}
