import Link from "next/link";
import { redirect } from "next/navigation";

import { CalendarDaysIcon, PlusIcon, TrophyIcon, ClockIcon, BoltIcon } from "@heroicons/react/24/outline";

import { getMatchDays } from "@/actions/match-days";
import Button from "@/components/ui/Button";
import { getAuthStatus } from "@/lib/services/auth";

export const runtime = "edge";

export default async function MatchDaysPage() {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    redirect("/");
  }

  const matchDays = await getMatchDays();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-600";
      case "live":
        return "bg-red-500/10 text-red-600";
      case "admin_review":
        return "bg-amber-500/10 text-amber-600";
      case "finished":
        return "bg-green-500/10 text-green-600";
      case "cancelled":
        return "bg-gray-500/10 text-gray-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programado";
      case "live":
        return "En Vivo";
      case "admin_review":
        return "Revisión";
      case "finished":
        return "Terminado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <section className="mx-4 mt-8 md:mx-10">
      <Link
        href="/dashboard"
        className="text-primary-darken hover:text-primary mb-6 inline-flex items-center transition-colors"
      >
        ← Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-foreground flex items-center text-2xl font-bold">
            <CalendarDaysIcon className="mr-3 h-7 w-7" />
            Gestión de Jornadas
          </h1>
          <p className="text-foreground mt-2">
            Administra partidos agrupados por fechas y gestiona eventos de forma eficiente
          </p>
        </div>

        <div className="flex space-x-3">
          <Link href="/dashboard/match-days/create">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nueva Jornada
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-card border-border rounded-lg border p-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="text-primary h-8 w-8" />
            <div className="ml-4">
              <div className="text-foreground text-2xl font-bold">{matchDays.length}</div>
              <div className="text-muted-foreground text-sm">Jornadas Totales</div>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <div className="text-foreground text-2xl font-bold">
                {matchDays.reduce((acc, day) => acc + day.matches.length, 0)}
              </div>
              <div className="text-muted-foreground text-sm">Partidos Totales</div>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <div className="flex items-center">
            <BoltIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <div className="text-foreground text-2xl font-bold">
                {matchDays.reduce((acc, day) => acc + day.totalEvents, 0)}
              </div>
              <div className="text-muted-foreground text-sm">Eventos Registrados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Days List */}
      <div className="space-y-6">
        {matchDays.length === 0 ? (
          <div className="bg-muted/50 text-muted-foreground rounded-lg p-12 text-center">
            <CalendarDaysIcon className="mx-auto h-16 w-16 opacity-50" />
            <h3 className="text-foreground mt-4 text-lg font-medium">No hay jornadas programadas</h3>
            <p className="mt-2">Comienza creando una nueva jornada con partidos programados.</p>
            <Link href="/dashboard/match-days/create" className="mt-4 inline-block">
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Crear Primera Jornada
              </Button>
            </Link>
          </div>
        ) : (
          matchDays.map((matchDay, index) => (
            <div
              key={`${matchDay.date}-${matchDay.competition_id}`}
              className="bg-card border-border rounded-lg border"
            >
              {/* Match Day Header */}
              <div className="border-border flex flex-col space-y-4 border-b p-6 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 text-primary rounded-lg p-3">
                    <CalendarDaysIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-lg font-semibold">{formatDate(matchDay.date)}</h2>
                    <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <TrophyIcon className="mr-1 h-4 w-4" />
                        {matchDay.competition_name}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="mr-1 h-4 w-4" />
                        {matchDay.matches.length} partidos
                      </div>
                      <div className="flex items-center">
                        <BoltIcon className="mr-1 h-4 w-4" />
                        {matchDay.totalEvents} eventos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/dashboard/match-days/${matchDay.date}/${matchDay.competition_id}`}>
                    <Button variant="outline" size="sm">
                      Gestionar Jornada
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Matches Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {matchDay.matches.map((match, matchIndex) => {
                    const matchTime = new Date(match.timestamp).toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div key={match.id} className="bg-background border-border rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="min-w-[80px] text-center">
                              <div className="text-foreground truncate text-sm font-medium">
                                {match.local_team_name}
                              </div>
                              <div className="text-muted-foreground text-xs">Local</div>
                            </div>

                            <div className="bg-muted text-muted-foreground rounded px-2 py-1 text-center">
                              <div className="text-sm font-bold">
                                {match.local_score} - {match.visitor_score}
                              </div>
                              <div className="text-xs">{matchTime}</div>
                            </div>

                            <div className="min-w-[80px] text-center">
                              <div className="text-foreground truncate text-sm font-medium">
                                {match.visitor_team_name}
                              </div>
                              <div className="text-muted-foreground text-xs">Visitante</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(match.status)}`}
                            >
                              {getStatusLabel(match.status)}
                            </div>
                            {match.events_count > 0 && (
                              <div className="text-muted-foreground mt-1 text-xs">{match.events_count} eventos</div>
                            )}
                          </div>
                        </div>

                        {Boolean(match.location) && (
                          <div className="text-muted-foreground mt-2 text-xs">📍 {match.location}</div>
                        )}

                        {Boolean(match.stream_url) && (
                          <div className="text-muted-foreground mt-1 text-xs">🎥 Stream disponible</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
