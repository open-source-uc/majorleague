import { redirect } from "next/navigation";

import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";
import { getTeams, createTeam, updateTeam, deleteTeam } from "@/actions/teams";

export const runtime = "edge";

export default async function TeamsPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  // Get teams from database
  const teams = await getTeams();

  return (
    <section className="mx-10 mt-8">
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
