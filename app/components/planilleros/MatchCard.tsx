import Link from "next/link";

interface MatchCardProps {
  match: any;
  planilleroStatus: string;
}

export function MatchCard({ match, planilleroStatus }: MatchCardProps) {
  const statusColors = {
    assigned: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 border border-blue-200",
    completed: "bg-green-100 text-green-800 border border-green-200",
  };

  const getMyTeamName = () => {
    return match.my_team_id === match.local_team_id ? match.local_team_name : match.visitor_team_name;
  };

  return (
    <div className="bg-background-header border-border-header hover:border-primary/30 rounded-lg border p-4 transition-all hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">
            {match.local_team_name} vs {match.visitor_team_name}
          </h3>
          <p className="text-foreground opacity-80">
            {new Date(match.timestamp).toLocaleDateString("es-CL", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            -
            {new Date(match.timestamp).toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {match.location ? <p className="text-foreground text-sm opacity-70">📍 {match.location}</p> : null}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[planilleroStatus as keyof typeof statusColors] || "bg-background border-border-header text-foreground border"}`}
        >
          {planilleroStatus === "assigned" && "Asignado"}
          {planilleroStatus === "in_progress" && "En Progreso"}
          {planilleroStatus === "completed" && "Completado"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm">
          Mi equipo: <span className="text-primary font-medium">{getMyTeamName()}</span>
        </span>
        <Link
          href={`/planillero/partido/${match.id}`}
          className="bg-primary hover:bg-primary-darken flex items-center gap-2 rounded px-4 py-2 text-white shadow-sm transition-colors"
        >
          📝 Ver Partido
        </Link>
      </div>
    </div>
  );
}
