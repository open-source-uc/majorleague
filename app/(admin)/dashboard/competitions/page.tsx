import Link from "next/link";
import { redirect } from "next/navigation";

import { getCompetitions, createCompetition, updateCompetition, deleteCompetition } from "@/actions/competitions";
import ObjectManager from "@/components/admin/ObjectManager";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function CompetitionsPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const competitions = await getCompetitions();

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>
      <ObjectManager
        objType="competitions"
        data={competitions}
        createAction={createCompetition}
        updateAction={updateCompetition}
        deleteAction={deleteCompetition}
      />
    </section>
  );
}
