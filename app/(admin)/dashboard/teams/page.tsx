import Link from "next/link";
import { redirect } from "next/navigation";

import { getTeams, createTeam, updateTeam, deleteTeam } from "@/actions/teams";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function TeamsPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const teams = await getTeams();

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>
      <ObjectManager
        objType="teams"
        data={teams}
        createAction={createTeam}
        updateAction={updateTeam}
        deleteAction={deleteTeam}
      />
    </section>
  );
}
