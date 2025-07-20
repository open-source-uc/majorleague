import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlayers, createPlayer, updatePlayer, deletePlayer } from "@/actions/players";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getTeamOptions, getProfileOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function PlayersPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [players, teamOptions, profileOptions] = await Promise.all([
    getPlayers(),
    getTeamOptions(),
    getProfileOptions(),
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
        objType="players"
        data={players}
        createAction={createPlayer}
        updateAction={updatePlayer}
        deleteAction={deletePlayer}
        dynamicOptions={{
          teams: teamOptions,
          profiles: profileOptions,
        }}
      />
    </section>
  );
}
