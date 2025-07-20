import Link from "next/link";
import { redirect } from "next/navigation";

import { getPreferences, createPreference, updatePreference, deletePreference } from "@/actions/preferences";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getProfileOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function PreferencesPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [preferences, profileOptions] = await Promise.all([getPreferences(), getProfileOptions()]);

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>
      <ObjectManager
        objType="preferences"
        data={preferences}
        createAction={createPreference}
        updateAction={updatePreference}
        deleteAction={deletePreference}
        dynamicOptions={{
          profiles: profileOptions,
        }}
      />
    </section>
  );
}
