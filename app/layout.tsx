import { Albert_Sans } from "next/font/google";

import { Metadata } from "next";

import Footer from "./components/ui/Footer";
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
    <html lang="es" suppressHydrationWarning={true} className={albert_sans.variable}>
      <body className={`${albert_sans.className} relative grid min-h-screen grid-rows-[auto_1fr_auto]`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
