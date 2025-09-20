"use client";

import React from "react";
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
  const { isLoggedIn,name } = useUserStore();
  const router = useRouter();
  // Wait for hydration to check isLoggedIn
  console.log(name);
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  React.useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.push("/login");
    }
  }, [hydrated, isLoggedIn, router]);
  return <div>{children}</div>;
}
