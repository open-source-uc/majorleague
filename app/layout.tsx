import { Albert_Sans } from "next/font/google";

import { Metadata } from "next";

import Navbar from "./components/ui/Navbar";
import Footer from "./components/home/Footer";
import "./globals.css";

const albert_sans = Albert_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-albert-sans",
});

export const metadata: Metadata = {
  title: "Major League",
  description: "Major League",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <link rel="preload" href="/assets/hero.png" as="image" />
        <link rel="preload" href="/assets/logo-horizontal.svg" as="image" type="image/svg+xml" />
      </head>
      <body className="relative grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Navbar />
        <main>{children}</main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
