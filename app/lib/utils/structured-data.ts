export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Major League UC",
    description: "Liga de fútbol universitario de la Universidad Católica de Chile",
    url: "https://majorleague.uc.cl",
    logo: "https://majorleague.uc.cl/assets/logo-horizontal.svg",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Spanish",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "CL",
      addressLocality: "Santiago",
    },
  };
}

export function generateSportsTeamSchema(teamData: any) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: teamData.team.name,
    description:
      teamData.teamPage?.description ||
      `Equipo representante de ${teamData.team.major || "la UC"}. ¡Únete a nosotros en esta gran aventura futbolística!`,
    sport: "Association football",
    url: `https://majorleague.uc.cl/equipos/${teamData.team.slug}`,
    logo: teamData.team.logo_url,
    memberOf: {
      "@type": "SportsOrganization",
      name: "Major League UC",
      url: "https://majorleague.uc.cl",
    },
    athlete: teamData.players.map((player: any) => ({
      "@type": "Person",
      name: `${player.first_name} ${player.last_name}`,
      jobTitle: player.position,
      memberOf: {
        "@type": "SportsTeam",
        name: teamData.team.name,
      },
    })),
  };
}

export function generateSportsEventSchema(match: any) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.local_team} vs ${match.visitor_team}`,
    description: `Partido de fútbol entre ${match.local_team} y ${match.visitor_team} en Major League UC`,
    sport: "Association football",
    startDate: match.match_date,
    location: {
      "@type": "Place",
      name: match.venue || "Cancha UC",
    },
    organizer: {
      "@type": "Organization",
      name: "Major League UC",
      url: "https://majorleague.uc.cl",
    },
    competitor: [
      {
        "@type": "SportsTeam",
        name: match.local_team,
      },
      {
        "@type": "SportsTeam",
        name: match.visitor_team,
      },
    ],
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
