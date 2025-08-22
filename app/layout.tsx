import { Albert_Sans } from "next/font/google";

import { Metadata } from "next";

import Footer from "./components/ui/Footer";
import Navbar from "./components/ui/Navbar";
import { generateOrganizationSchema } from "./lib/utils/structured-data";
import "./styles/globals.css";

const albert_sans = Albert_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://majorleague.uc.cl"),
  title: {
    default: "Major League UC - Fútbol Universitario",
    template: "%s | Major League UC",
  },
  description:
    "La liga de fútbol más emocionante de la Universidad Católica. Sigue los partidos, equipos y estadísticas de Major League UC.",
  keywords: ["fútbol universitario", "UC", "Major League", "deportes", "universidad católica", "chile"],
  authors: [{ name: "Major League UC" }],
  creator: "Major League UC",
  publisher: "Universidad Católica de Chile",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://majorleague.uc.cl",
    siteName: "Major League UC",
    title: "Major League UC - Fútbol Universitario",
    description:
      "La liga de fútbol más emocionante de la Universidad Católica. Sigue los partidos, equipos y estadísticas.",
    images: [
      {
        url: "/assets/logo-horizontal.svg",
        width: 1200,
        height: 630,
        alt: "Major League UC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Major League UC - Fútbol Universitario",
    description:
      "La liga de fútbol más emocionante de la Universidad Católica. Sigue los partidos, equipos y estadísticas.",
    images: ["/assets/logo-horizontal.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="es" suppressHydrationWarning={true} className={albert_sans.className}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "84cbc39686f64c339872cc677134c118"}'
        />
      </head>
      <body className="relative grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
