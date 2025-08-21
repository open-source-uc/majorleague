import Link from "next/link";

import { getMatchesWithPlanilleros, getAllMatchesWithPlanilleros } from "@/actions/planilleros";
import { getProfiles } from "@/actions/profiles";
import { PlanilleroManager } from "@/components/admin/PlanilleroManager";

export const runtime = "edge";

export default async function PlanillerosAdminPage() {
  const [matchesNeedingPlanilleros, allMatches, profiles] = await Promise.all([
    getMatchesWithPlanilleros(),
    getAllMatchesWithPlanilleros(),
    getProfiles(),
  ]);

  return (
    <section className="mx-10 mt-8">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">Gestión de Planilleros</h1>
        <p className="text-foreground mt-2">Asigna y gestiona planilleros para los partidos programados</p>
      </div>

      <PlanilleroManager matches={matchesNeedingPlanilleros} allMatches={allMatches} profiles={profiles} />
    </section>
  );
}
