import { getPlanilleroMatchesGroupedByStatus } from "@/actions/planilleros";
import { MatchCard } from "@/components/planilleros/MatchCard";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function PlanilleroPage() {
  const { userProfile } = await getAuthStatus();

  if (!userProfile) {
    return <div>Error: Usuario no encontrado</div>;
  }

  const matchesGrouped = await getPlanilleroMatchesGroupedByStatus(userProfile.id);

  const { live: liveMatches, in_review: reviewMatches, scheduled: upcomingMatches } = matchesGrouped;
  const totalMatches = upcomingMatches.length + liveMatches.length + reviewMatches.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-background-header border-border-header rounded-lg border p-6">
        <h2 className="text-foreground mb-2 text-2xl font-bold">Mis Partidos Asignados</h2>
        <p className="text-foreground opacity-80">Gestiona los partidos donde eres planillero oficial</p>
        {totalMatches > 0 && (
          <div className="mt-3 flex items-center gap-4">
            <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-3 py-1 text-sm font-medium">
              Total: {totalMatches} partidos
            </span>
          </div>
        )}
      </div>

      {/* Partidos En Vivo */}
      {liveMatches.length > 0 && (
        <section>
          <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="text-red-500">🔴</span>
            En Vivo ({liveMatches.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match: any) => (
              <MatchCard key={match.id} match={match} planilleroStatus={match.planillero_status} />
            ))}
          </div>
        </section>
      )}

      {/* Partidos En Revisión */}
      {reviewMatches.length > 0 && (
        <section>
          <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="text-blue-500">📋</span>
            En Revisión ({reviewMatches.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviewMatches.map((match: any) => (
              <MatchCard key={match.id} match={match} planilleroStatus={match.planillero_status} />
            ))}
          </div>
        </section>
      )}

      {/* Próximos Partidos */}
      {upcomingMatches.length > 0 && (
        <section>
          <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="text-green-500">📅</span>
            Próximos ({upcomingMatches.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match: any) => (
              <MatchCard key={match.id} match={match} planilleroStatus={match.planillero_status} />
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {totalMatches === 0 && (
        <div className="bg-background-header border-border-header rounded-lg border py-16 text-center">
          <div className="mb-4 text-6xl">📝</div>
          <h3 className="text-foreground mb-2 text-lg font-medium">No tienes partidos asignados</h3>
          <p className="text-foreground opacity-70">Los administradores te asignarán partidos próximamente</p>
        </div>
      )}
    </div>
  );
}
