import Link from "next/link";
import { redirect } from "next/navigation";

import { getLineups, createLineup, updateLineup, deleteLineup } from "@/actions/lineups";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getTeamOptions, getMatchOptions, getPlayerOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function LineupsPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [lineups, teamOptions, matchOptions, playerOptions] = await Promise.all([
    getLineups(),
    getTeamOptions(),
    getMatchOptions(),
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
        objType="lineups"
        data={lineups}
        createAction={createLineup}
        updateAction={updateLineup}
        deleteAction={deleteLineup}
        dynamicOptions={{
          teams: teamOptions,
          matches: matchOptions,
          players: playerOptions,
        }}
      />
    </section>
  );
}
