import Link from "next/link";
import { redirect } from "next/navigation";

import { getEvents, createEvent, updateEvent, deleteEvent } from "@/actions/events";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getMatchOptions, getTeamOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function EventsPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [events, matchOptions, teamOptions] = await Promise.all([getEvents(), getMatchOptions(), getTeamOptions()]);

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>
      <ObjectManager
        objType="events"
        data={events}
        createAction={createEvent}
        updateAction={updateEvent}
        deleteAction={deleteEvent}
        dynamicOptions={{
          matches: matchOptions,
          teams: teamOptions,
        }}
      />
    </section>
  );
}
