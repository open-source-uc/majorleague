import { MetadataRoute } from "next";

import { teams } from "@/lib/constants/teams";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://majorleague.uc.cl";

  // Static pages
  const staticPages = ["", "/acerca", "/torneo", "/equipos", "/transmisiones", "/participa"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Team pages from constants
  const teamPages = teams.map((team) => ({
    url: `${baseUrl}/equipos/${team.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Position pages for current and previous year
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1];
  const semesters = ["1", "2"];

  const positionPages = years.flatMap((year) =>
    semesters.map((semester) => ({
      url: `${baseUrl}/posiciones/${year}/${semester}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  );

  return [...staticPages, ...teamPages, ...positionPages];
}
