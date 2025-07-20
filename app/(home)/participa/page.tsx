export const runtime = "edge";
// import Image from "next/image";
// import { redirect } from "next/navigation";

// import { isAuthUser } from "@/actions/auth";
// import { hasParticipated } from "@/actions/participation";
// import { getTeams } from "@/actions/teams";
// import ParticipationForm from "@/components/forms/ParticipationForm";
// import placeholder from "@/public/assets/placeholder.svg";

export default async function ParticipaPage() {
  //   const teams = (await getTeams()) || [];
  //   const user = await isAuthUser();
  //   // Descomentar para prod (usuario logeado para hacer el form)
  //   if (!user) {
  //     redirect("/register?from=participa");
  //   }
  //   if (user) {
  //     const participated = await hasParticipated(user.id);
  //     console.log("participated", participated);
  //     if (participated) {
  //       redirect("/participa/gracias?from=participa");
  //     }
  //   }
  //   return (
  //     <div className="flex flex-col items-center justify-center py-10 lg:flex-row lg:gap-10">
  //       <div className="w-full max-w-2xl">
  //         <ParticipationForm teams={teams} />
  //       </div>
  //       <div className="hidden lg:block">
  //         <Image src={placeholder} alt="Minerham Logo" width={300} height={300} className="object-contain" priority />
  //       </div>
  //     </div>
  //   );
}
