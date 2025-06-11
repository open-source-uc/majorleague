import Image from "next/image";

import caiLogo from "@/public/assets/caiLogo.png";
import osucLogo from "@/public/assets/osucLogo.png";
import ucLogo from "@/public/assets/ucLogo.svg";

export default function Sponsors() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="text-md font-bold">SPONSORS DE LA LIGA</p>
      <div className="flex items-center gap-24">
        <Image src={caiLogo} alt="CAI Logo" loading="lazy" sizes="(max-width: 768px) 80px, 120px" />
        <Image src={osucLogo} alt="OSUC Logo" loading="lazy" sizes="(max-width: 768px) 80px, 120px" />
        <Image src={ucLogo} alt="UC Logo" loading="lazy" sizes="(max-width: 768px) 80px, 120px" />
      </div>
    </div>
  );
}
