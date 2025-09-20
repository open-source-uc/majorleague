import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { getMatchDayDetails } from "@/actions/match-days";
import BulkActions from "@/components/admin/BulkActions";
import MatchBundle from "@/components/admin/MatchBundle";
import { getAuthStatus } from "@/lib/services/auth";
import { getTeamOptions, getPlayerOptions } from "@/lib/utils/admin-options";

export const runtime = "edge";

interface Params {
  date: string;
  competitionId: string;
}

export default async function MatchDayDetailsPage({ params }: { params: Promise<Params> }) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const { date, competitionId } = await params;
  const competitionIdNum = parseInt(competitionId);
  const { matches, events } = await getMatchDayDetails(date, competitionIdNum);
  const [teamOptions, playerOptions] = await Promise.all([getTeamOptions(), getPlayerOptions()]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">Jornada del {formatDate(date)}</h1>
        <p className="text-muted-foreground mt-2">Gestiona todos los partidos y eventos de esta fecha</p>
      </div>

      {/* Matches */}
      <div className="space-y-6">
        {matches.length === 0 ? (
          <div className="bg-muted/50 text-muted-foreground rounded-lg p-12 text-center">
            <h3 className="text-foreground mt-4 text-lg font-medium">No hay partidos en esta jornada</h3>
            <p className="mt-2">Los partidos de esta fecha no están disponibles o han sido eliminados.</p>
          </div>
        ) : (
          matches.map((match: import("@/actions/match-days").MatchWithData) => (
            <MatchBundle
              key={match.id}
              match={match}
              events={events}
              teamOptions={teamOptions}
              playerOptions={playerOptions}
            />
          ))
        )}
      </div>

      {/* Bulk Actions */}
      {matches.length > 0 && <BulkActions matches={matches} />}
    </section>
  );
}
