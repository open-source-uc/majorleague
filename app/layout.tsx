import { Instrument_Sans } from "next/font/google";

import { Metadata } from "next";
import "./globals.css";

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
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
    <html lang="es" className={instrument_sans.variable} suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Major League</title>
      </head>
      <body className="bg-background text-foreground tablet:px-8 space-y-12 px-4">
        <main className="flex w-full flex-col">{children}</main>
      </body>
    </html>
  );
}
