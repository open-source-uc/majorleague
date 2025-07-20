import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfiles, createProfile, updateProfile, deleteProfile } from "@/actions/profiles";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function ProfilesPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const profiles = await getProfiles();

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>
      <ObjectManager
        objType="profiles"
        data={profiles}
        createAction={createProfile}
        updateAction={updateProfile}
        deleteAction={deleteProfile}
      />
    </section>
  );
}
