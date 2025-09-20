import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import { useUserStore } from "./store/userStore";
const fontPrimary = Instrument_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
});

const geist_mono = Geist_Mono({
  weight: ["100", "200", "300", "400", "500", "600"],
  variable: "--font-geist-mono"
})

export const metadata: Metadata = {
  title: "OutWorks",
  description: "OutWorks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontPrimary.className} ${geist_mono.variable} antialiased p-2 overflow-hidden pr-0 font-primary text-foreground bg-background flex`}
      >
        <Sidebar />
        <div className="flex flex-col size-full overflow-y-auto">
          <Topbar />
          {children}
        </div>
      </body>
    </html>
  );
}
