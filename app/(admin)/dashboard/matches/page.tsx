import Link from "next/link";
import { redirect } from "next/navigation";

import { getMatches, createMatch, updateMatch, deleteMatch } from "@/actions/matches";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getTeamOptions, getCompetitionOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function MatchesPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [matches, teamOptions, competitionOptions] = await Promise.all([
    getMatches(),
    getTeamOptions(),
    getCompetitionOptions(),
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
        objType="matches"
        data={matches}
        createAction={createMatch}
        updateAction={updateMatch}
        deleteAction={deleteMatch}
        dynamicOptions={{
          teams: teamOptions,
          competitions: competitionOptions,
        }}
      />
    </section>
  );
}
