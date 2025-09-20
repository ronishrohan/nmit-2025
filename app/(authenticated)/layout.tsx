"use client";

import { useUserStore } from "../store/userStore";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoggedIn } = useUserStore();
  const router = useRouter();
  if (!isLoggedIn) {
    router.push("/login");
  }
  return (
    <html lang="en">
      <body
        className={` antialiased p-2 pr-0 font-primary text-foreground bg-background flex`}
      >
        <div className="flex flex-col size-full ">{children}</div>
      </body>
    </html>
  );
}
