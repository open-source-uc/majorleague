import Link from "next/link";
import { redirect } from "next/navigation";

import { getEventPlayers, createEventPlayer, updateEventPlayer, deleteEventPlayer } from "@/actions/event-players";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getEventOptions, getPlayerOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function EventPlayersPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) redirect("/");

  const [rows, eventOptions, playerOptions] = await Promise.all([
    getEventPlayers(),
    getEventOptions(),
    getPlayerOptions(),
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
        objType="event_players"
        data={rows}
        createAction={createEventPlayer}
        updateAction={updateEventPlayer}
        deleteAction={deleteEventPlayer}
        dynamicOptions={{
          events: eventOptions,
          players: playerOptions,
        }}
      />
    </section>
  );
}
