import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfile } from "@/actions/auth";
import FormProfile from "@/components/forms/FormProfile";
import { getUserDataByToken } from "@/lib/services/auth";

export const runtime = "edge";

export default async function Login() {
  const userData = await getUserDataByToken();
  if (userData) {
    // Check if profile is created
    const userProfile = await getProfile(userData);
    if (!userProfile) {
      return (
        <div className="flex h-screen items-center justify-center">
          <FormProfile userId={userData.id} />
        </div>
      );
    }
    redirect("/profile");
  }

  return (
    <section className="mx-10 mt-8 flex flex-col">
      <h2 className="text-xl">
        Luego de iniciar sesion o registrarte con tu cuenta de auth osuc, se te pedira crear un perfil
      </h2>
      <Link
        href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
        className="text-primary-darken text-md border-primary-darken hover:text-primary hover:border-primary hidden max-w-36 rounded-md border-2 border-solid px-4 py-2 font-bold tracking-normal transition-colors lg:inline"
      >
        Cuenta OSUC
      </Link>
    </section>
  );
}
