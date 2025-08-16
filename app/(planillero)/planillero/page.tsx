import { getPlanilleroMatchesGroupedByStatus } from "@/actions/planilleros";
import { MatchCard } from "@/components/planilleros/MatchCard";
import { getAuthStatus } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const runtime = "edge";

export default async function PlanilleroPage() {
  const { userProfile } = await getAuthStatus();

  if (!userProfile) {
    redirect("/login");
  }

  const matches = await getPlanilleroMatchesGroupedByStatus(userProfile.id);

  const totalMatches = matches.live.length + matches.in_review.length + matches.scheduled.length;

  return (
    <div className="space-y-8">
      <Link
        href="/perfil"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Perfil
      </Link>

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
      {matches.live.length > 0 && (
        <section>
          <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="text-red-500">🔴</span>
            En Vivo ({matches.live.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">  
            {matches.live.map((match) => (
              <MatchCard prefetch={true} key={match.id} match={match} userProfile={userProfile} />
            ))}
          </div>
        </section>
      )}

      {/* Partidos En Revisión */}
      {matches.in_review.length > 0 && (
        <section>
          <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="text-blue-500">📋</span>
            En Revisión ({matches.in_review.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.in_review.map((match) => (
              <MatchCard prefetch={true} key={match.id} match={match} userProfile={userProfile} />
            ))}
          </div>
        </section>
      )}

      {/* Próximos Partidos */}
      {matches.scheduled.length > 0 && (
        <section>
          <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="text-green-500">📅</span>
            Próximos ({matches.scheduled.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.scheduled.map((match) => (
              <MatchCard prefetch={false} key={match.id} match={match} userProfile={userProfile} />
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
