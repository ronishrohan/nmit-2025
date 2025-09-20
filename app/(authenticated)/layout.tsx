"use client";

import { useUserStore } from "../store/userStore";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import { useEffect } from "react";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoggedIn } = useUserStore();
  const router = useRouter();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }

  }, [isLoggedIn])
  return (


    <div >{children}</div>


  );
}
