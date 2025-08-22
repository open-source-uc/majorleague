import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/planillero/", "/capitan/", "/(admin)/", "/(captain)/", "/(planillero)/"],
    },
    sitemap: "https://majorleague.uc.cl/sitemap.xml",
  };
}
