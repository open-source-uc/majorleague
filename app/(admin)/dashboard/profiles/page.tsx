import { redirect } from "next/navigation";

import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getProfiles, createProfile, updateProfile, deleteProfile } from "@/actions/profiles";

export const runtime = "edge";

export default async function ProfilesPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  // Get profiles from database
  const profiles = await getProfiles();

  return (
    <section className="mx-10 mt-8">
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
