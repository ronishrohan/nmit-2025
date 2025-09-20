"use client"
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass'
import { usePathname } from 'next/navigation'
import React from 'react'

const titles = {
  "/dashboard": "Dashboard",
} as const;

const Topbar = () => {
  const pathname = usePathname();
  const title = (titles as Record<string, string>)[pathname as string] ?? "";

  return (
    <div className='h-[86px] shrink-0 border-b-2 border-b-border p-4 flex'>
      <div className='h-full flex items-center text-2xl font-bold px-4'>
        {title}
      </div>
    </div>
  );
};

export default Topbar;
