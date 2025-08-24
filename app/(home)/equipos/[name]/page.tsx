import Image from "next/image";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { getCompleteTeamData, getTeamBySlug } from "@/actions/team-data";
import ContactInfo from "@/components/teams/ContactInfo";
import FinishedMatches from "@/components/teams/FinishedMatches";
import PhotoCarousel from "@/components/teams/PhotoCarousel";
import PlayerCard from "@/components/teams/PlayerCard";
import TeamEditButton from "@/components/teams/TeamEditButton";
import TeamStats from "@/components/teams/TeamStats";
import UpcomingMatches from "@/components/teams/UpcomingMatches";
import { teams } from "@/lib/constants/teams";
import { getAuthStatus } from "@/lib/services/auth";
import { generateSportsTeamSchema, generateBreadcrumbSchema } from "@/lib/utils/structured-data";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;

  // Get team logo from static data
  const staticTeam = teams.find((team) => team.slug === name);
  if (!staticTeam) {
    return {
      title: "Equipo no encontrado",
      description: "El equipo solicitado no existe en Major League UC",
    };
  }

  // Get complete team data from database
  const dbTeam = await getTeamBySlug(name);
  if (!dbTeam) {
    return {
      title: `${staticTeam.name}`,
      description: `Equipo ${staticTeam.name} de Major League UC`,
    };
  }

  const teamData = await getCompleteTeamData(dbTeam.id);
  if (!teamData) {
    return {
      title: `${staticTeam.name}`,
      description: `Equipo ${staticTeam.name} de Major League UC`,
    };
  }

  const teamName = teamData.team.name;
  const description =
    teamData.teamPage?.description ||
    `Conoce al equipo ${teamName} de Major League UC. Plantilla, estadísticas y próximos partidos de fútbol universitario. ${staticTeam.departments}`;

  const imageUrl = teamData.photos[0]?.url || "/assets/logo-horizontal.svg";
  const keywords = [
    teamName,
    "fútbol universitario",
    "UC",
    "Major League",
    staticTeam.departments,
    "plantilla",
    "estadísticas",
    "partidos",
  ].join(", ");

  return {
    title: `${teamName} - Equipo de Fútbol`,
    description,
    keywords,
    openGraph: {
      title: `${teamName} - Major League UC`,
      description,
      url: `https://majorleague.uc.cl/equipos/${name}`,
      siteName: "Major League UC",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Equipo ${teamName} - Major League UC`,
        },
      ],
      locale: "es_CL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${teamName} - Major League UC`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://majorleague.uc.cl/equipos/${name}`,
    },
  };
}

export default async function TeamPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  // Get team logo from static data (for now)
  const staticTeam = teams.find((team) => team.slug === name);
  if (!staticTeam) {
    redirect("/equipos");
  }

  // Get complete team data from database
  const dbTeam = await getTeamBySlug(name);
  if (!dbTeam) {
    redirect("/equipos");
  }

  const teamData = await getCompleteTeamData(dbTeam.id);

  if (!teamData) {
    redirect("/equipos");
  }
  console.log(teamData);

  // Get auth status for edit button
  const { isAdmin, userProfile } = await getAuthStatus();
  const isCaptain = userProfile?.id === dbTeam.captain_id;

  // Generate structured data
  const teamStructuredData = generateSportsTeamSchema(teamData);
  const breadcrumbData = generateBreadcrumbSchema([
    { name: "Inicio", url: "https://majorleague.uc.cl" },
    { name: "Equipos", url: "https://majorleague.uc.cl/equipos" },
    { name: teamData.team.name, url: `https://majorleague.uc.cl/equipos/${name}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="bg-primary px-4 py-8 md:px-5 md:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center md:h-20 md:w-20 lg:h-24 lg:w-24">
                <Image
                  src={staticTeam.logo}
                  alt={staticTeam.alt}
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                  priority
                  sizes="(max-width: 768px) 64px, (max-width: 1024px) 80px, 96px"
                />
              </div>
              <div className="min-w-0 flex-1 text-center md:text-left">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="mb-2 text-2xl font-bold break-words text-black md:mb-3 md:text-4xl lg:text-6xl">
                      {teamData.team.name}
                    </h1>
                    <p className="max-w-2xl px-2 text-sm leading-relaxed text-black/80 md:px-0 md:text-lg lg:text-xl">
                      {teamData.teamPage?.description ||
                        `Equipo representante de ${teamData.team.major || "la UC"}. ¡Únete a nosotros en esta gran aventura futbolística!`}
                    </p>
                    {teamData.teamPage?.motto ? (
                      <p className="mt-1.5 max-w-2xl px-2 text-sm text-black/70 italic md:mt-2 md:px-0 md:text-base lg:text-lg">
                        &quot;{teamData.teamPage.motto}&quot;
                      </p>
                    ) : null}
                  </div>

                  {/* Edit Button */}
                  <div className="mt-2 flex-shrink-0 md:mt-0">
                    <TeamEditButton teamSlug={name} isAdmin={isAdmin} isCaptain={!!isCaptain} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 md:px-5 md:py-10">
          {/* Mobile Layout */}
          <div className="block space-y-6 md:hidden">
            {/* Team Stats */}
            <TeamStats stats={teamData.stats} />

            {/* Players Section */}
            <section className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <h2 className="text-foreground mb-4 text-xl font-bold md:mb-6 md:text-2xl">Plantilla del Equipo</h2>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {teamData.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="animate-in fade-in-0 slide-in-from-left-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PlayerCard player={player} animationDelay={`${index * 100}ms`} />
                  </div>
                ))}
              </div>
            </section>

            {/* Photo Carousel */}
            <PhotoCarousel
              photos={teamData.photos.map((photo) => ({
                id: photo.id,
                url: photo.url,
                caption: photo.caption,
                team_id: photo.team_id,
                order_index: photo.order_index,
              }))}
            />

            {/* Upcoming Matches */}
            <UpcomingMatches
              matches={teamData.upcomingMatches.map((match) => ({
                id: match.id,
                opponent: match.opponent,
                date: match.date,
                time: match.time,
                venue: match.venue,
                type: match.type,
                status: match.status,
              }))}
            />

            {/* Contact Info */}
            {teamData.teamPage ? (
              <ContactInfo
                contact={{
                  id: teamData.teamPage?.id,
                  team_id: teamData.teamPage?.team_id,
                  instagram_handle: teamData.teamPage?.instagram_handle,
                  captain_email: teamData.teamPage?.captain_email,
                }}
                teamName={teamData.team.name}
              />
            ) : null}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            {/* Team Stats */}
            <div className="mb-8 md:mb-10">
              <TeamStats stats={teamData.stats} />
            </div>

            <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-2">
              {/* Left Column - Players */}
              <div className="animate-in fade-in-0 slide-in-from-left-4 duration-700">
                <h2 className="text-foreground mb-6 text-2xl font-bold md:mb-8 md:text-3xl">Plantilla del Equipo</h2>
                <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
                  {teamData.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <PlayerCard player={player} animationDelay={`${index * 50}ms`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Photos and Matches */}
              <div className="space-y-6 md:space-y-8">
                <PhotoCarousel
                  photos={teamData.photos.map((photo) => ({
                    id: photo.id,
                    url: photo.url,
                    caption: photo.caption,
                    team_id: photo.team_id,
                    order_index: photo.order_index,
                  }))}
                />
                <UpcomingMatches
                  matches={teamData.upcomingMatches.map((match) => ({
                    id: match.id,
                    opponent: match.opponent,
                    date: match.date,
                    time: match.time,
                    venue: match.venue,
                    type: match.type,
                    status: match.status,
                  }))}
                />
                <FinishedMatches
                  matches={teamData.finishedMatches.map((match) => ({
                    id: match.id,
                    opponent: match.opponent,
                    date: match.date,
                    time: match.time,
                    venue: match.venue,
                    type: match.type,
                    status: match.status,
                    local_score: match.local_score,
                    visitor_score: match.visitor_score,
                  }))}
                />
              </div>
            </div>

            {/* Contact Info - Full Width at Bottom */}
            <div className="mt-10 md:mt-12">
              {teamData.teamPage ? (
                <ContactInfo
                  contact={{
                    id: teamData.teamPage?.id,
                    team_id: teamData.teamPage?.team_id,
                    instagram_handle: teamData.teamPage?.instagram_handle,
                    captain_email: teamData.teamPage?.captain_email,
                  }}
                  teamName={teamData.team.name}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
