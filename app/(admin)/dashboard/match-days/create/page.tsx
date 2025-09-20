import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import MatchDayForm from "@/components/admin/MatchDayForm";
import { getAuthStatus } from "@/lib/services/auth";
import { getTeamOptions, getCompetitionOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

export default async function CreateMatchDayPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const [teamOptions, competitionOptions] = await Promise.all([getTeamOptions(), getCompetitionOptions()]);

  return (
    <section className="mx-4 mt-8 md:mx-10">
      <div className="mb-6 flex items-center space-x-4">
        <Link
          href="/dashboard/match-days"
          className="text-primary-darken hover:text-primary inline-flex items-center transition-colors"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver a Jornadas
        </Link>
      </div>

      <MatchDayForm
        teamOptions={teamOptions}
        competitionOptions={competitionOptions}
        onSuccess={() => {
          // Redirect back to match days after successful creation
          window.location.href = "/dashboard/match-days";
        }}
      />
    </section>
  );
}
