import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const fontPrimary = Instrument_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans"
})

export const metadata: Metadata = {
  title: "Manufacturing CRM",
  description: "A manufacturing crm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontPrimary.className} antialiased font-primary text-foreground bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
