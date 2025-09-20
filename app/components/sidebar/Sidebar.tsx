"use client"
import React, { ReactNode } from "react"
import { motion } from "motion/react"
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { PlusCircle } from "@phosphor-icons/react/dist/ssr/PlusCircle";
import { Package } from "@phosphor-icons/react/dist/ssr/Package";
import { Files } from "@phosphor-icons/react/dist/ssr/Files";

const SidebarButton = ({ children, icon, active }: { children: ReactNode, icon: ReactNode, active: boolean }) => {
    return <button className={`rounded-xl flex gap-4 items-center  text-xl outline-none  p-4 ${active ? "text-zinc-900 bg-accent-green font-medium" : "text-inactive font-medium hover:bg-white hover:text-zinc-900"}  transition-all duration-100`} >
        {icon} {children}
    </button>
}

function Sidebar() {

    return <div className="w-[320px] shrink-0 h-full flex flex-col rounded-xl border-2 border-border">
        <div className="h-[84px] text-3xl font-bold border-b-2 flex items-center px-6 border-border" >
            MANUFAC4
        </div>
        <div className="h-fit flex flex-col w-full p-4 gap-2" >
            <SidebarButton active={true} icon={<House size={26} weight="bold" />} >Dashboard</SidebarButton>
            <SidebarButton active={false} icon={<Package size={26} weight="bold" />} >Orders</SidebarButton>
            <SidebarButton active={false} icon={<Files size={26} weight="bold" />} >Reports</SidebarButton>
            <SidebarButton active={false} icon={<PlusCircle size={26} weight="bold" />} >Create Order</SidebarButton>
        </div>
        <div className="border-t-2 border-border h-[84px] w-full mt-auto p-4 gap-4 flex" >
            <div className="h-full aspect-square shrink-0
            rounded-lg bg-gradient-to-br from-accent to-accent-red" ></div>
            <div className="flex flex-col h-full justify-center" >
                <div className="text-lg font-semibold leading-4" >John Doe</div>
                <div className="font-medium text-inactive" >example@gmail.com</div>
            </div>
        </div>
    </div>
}


export default Sidebar;