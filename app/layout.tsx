import { Albert_Sans } from "next/font/google";

import { Metadata } from "next";

import Navbar from "./components/ui/Navbar";
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
    <html lang="es" className={albert_sans.variable} suppressHydrationWarning={true}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
