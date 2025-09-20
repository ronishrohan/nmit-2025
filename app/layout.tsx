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
        className={`${fontPrimary.className} antialiased p-2 pr-0 font-primary text-foreground bg-background flex`}
      >
        <Sidebar />
        <div className="flex flex-col size-full ">
          <Topbar />
          {children}
        </div>
      </body>
    </html>
  );
}
