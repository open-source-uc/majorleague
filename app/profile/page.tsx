import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function Profile() {
  const { isAdmin, isAuthenticated, userProfile } = await getAuthStatus();
  if (!isAuthenticated) {
    return redirect("/login");
  }

  return (
    <section className="mx-10 my-10 flex flex-col gap-2">
      <p>Tu informacion:</p>
      <p>Username: {userProfile.username}</p>
      <p>Email: {userProfile.email}</p>
      <div className="flex flex-col gap-1">
        <p>Cerrar Sesion:</p>
        <Link
          href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
          className="border-primary-darken max-w-30 border-1 p-2"
        >
          Cuenta OSUC
        </Link>
        {isAdmin ? (
          <Link href="/dashboard" className="border-primary-darken max-w-30 border-1 p-2">
            Admin Dashboard
          </Link>
        ) : null}
      </div>
    </section>
  );
}
