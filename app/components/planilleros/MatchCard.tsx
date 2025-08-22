import Link from "next/link";

import { MatchPlanilleroExtended } from "@/actions/planilleros";
import { Profile } from "@/lib/types";

interface MatchCardProps {
  match: MatchPlanilleroExtended;
  prefetch: boolean;
  userProfile: Profile;
}

export function MatchCard({ match, prefetch, userProfile }: MatchCardProps) {
  if (!userProfile) {
    return null;
  }

  const statusColors = {
    assigned: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 border border-blue-200",
    completed: "bg-green-100 text-green-800 border border-green-200",
    admin_review: "bg-purple-100 text-purple-800 border border-purple-200",
  };

  // Remove myTeamName logic since planilleros now work with both teams

  return (
    <div className="bg-background-header border-border-header hover:border-primary/30 rounded-lg border p-4 transition-all hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">
            {match.local_team_name} vs {match.visitor_team_name}
          </h3>
          <p className="text-foreground opacity-80">
            {(() => {
              const raw = String(match.timestamp);
              const [datePart, timePartFull = ""] = raw.includes("T") ? raw.split("T") : raw.split(" ");
              const [y, m, d] = datePart.split("-").map((v) => parseInt(v, 10));
              const [hh = "00", mm = "00"] = timePartFull.split(":");
              const dt = new Date(y, (m || 1) - 1, d || 1, parseInt(hh, 10) || 0, parseInt(mm, 10) || 0);
              const dateText = dt.toLocaleDateString("es-CL", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const timeText = dt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
              return `${dateText} - ${timeText}`;
            })()}
          </p>
          {match.location ? <p className="text-foreground text-sm opacity-70">📍 {match.location}</p> : null}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[match.planillero_status as keyof typeof statusColors] || "bg-background border-border-header text-foreground border"}`}
        >
          {match.planillero_status === "assigned" && "Asignado"}
          {match.planillero_status === "in_progress" && "En Progreso"}
          {match.planillero_status === "completed" && "Completado"}
          {match.planillero_status === "admin_review" && "Revisión Admin"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm">
          Planillero para: <span className="text-primary font-medium">Ambos equipos</span>
        </span>
        <Link
          prefetch={prefetch}
          href={`/planillero/partido/${match.id}`}
          className="bg-primary hover:bg-primary-darken flex items-center gap-2 rounded px-4 py-2 text-white shadow-sm transition-colors"
        >
          📝 Ver Partido
        </Link>
      </div>
    </div>
  );
}
