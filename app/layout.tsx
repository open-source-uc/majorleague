import { Albert_Sans } from "next/font/google";

import { Metadata } from "next";

import Footer from "./components/ui/Footer";
import Navbar from "./components/ui/Navbar";
import "./styles/globals.css";

const albert_sans = Albert_Sans({
  subsets: ["latin"],
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
    <html lang="es" suppressHydrationWarning={true} className={albert_sans.className}>
      <head>
        <link rel="preload" href="/assets/hero.png" as="image" />
        <link rel="preload" href="/assets/logo-horizontal.svg" as="image" type="image/svg+xml" />
      </head>
      <body className="relative grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
