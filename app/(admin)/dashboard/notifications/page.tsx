import Link from "next/link";
import { redirect } from "next/navigation";

import { getNotifications, createNotification, updateNotification, deleteNotification } from "@/actions/notifications";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getProfileOptions, getMatchOptions, getPreferenceOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function NotificationsPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [notifications, profileOptions, matchOptions, preferenceOptions] = await Promise.all([
    getNotifications(),
    getProfileOptions(),
    getMatchOptions(),
    getPreferenceOptions(),
  ]);

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>
      <ObjectManager
        objType="notifications"
        data={notifications}
        createAction={createNotification}
        updateAction={updateNotification}
        deleteAction={deleteNotification}
        dynamicOptions={{
          profiles: profileOptions,
          matches: matchOptions,
          preferences: preferenceOptions,
        }}
      />
    </section>
  );
}
