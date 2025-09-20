"use client";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { usePathname } from "next/navigation";
import React from "react";
import { useUserStore } from "@/app/store/userStore";
const titles: Record<string, string[]> = {
  "/dashboard": ["Dashboard", "See all your important data in one place"],
  "/order": ["Order", "Overview of a order"],
  "/create-order": ["Create Order", "Create a manufacturing order"],

  "/manufacturing-orders": [
    "Manufacturing Orders",
    "Manage your manufacturing orders and production planning"
  ],
  "/work-orders": [
    "Work Orders",
    "Track and manage individual work orders and their operations"
  ],
  "/bom": [
    "Bill of Materials",
    "Manage product structures, components, and material requirements"
  ],
  "/work-center": [
    "Work Centers",
    "Manage work centers, machines, and production resources"
  ],
  "/stock-ledger": [
    "Stock Ledger",
    "Track inventory levels, stock movements, and material transactions"
  ]
} as const;


const Topbar = () => {
  const pathname = usePathname();
  const matchedKey = Object.keys(titles).find((key) => pathname.includes(key));
  const title = matchedKey ? titles[matchedKey] : "";
  const { isLoggedIn } = useUserStore();
  if (!isLoggedIn) return null;
  return (
    <div className="h-[86px] shrink-0 border-b-2 border-b-border p-4 flex">
      <div className="h-full flex flex-col items-start justify-between  text-2xl font-bold px-4">
        <div className="leading-5">{title[0]}</div>
        <div className="text-lg font-medium text-inactive">{title[1]}</div>
      </div>
    </div>
  );
};

export default Topbar;
