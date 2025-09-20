"use client";
import React, { ReactNode, use, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { PlusCircle } from "@phosphor-icons/react/dist/ssr/PlusCircle";
import { Package } from "@phosphor-icons/react/dist/ssr/Package";
import { Files } from "@phosphor-icons/react/dist/ssr/Files";
import { GearSix } from "@phosphor-icons/react/dist/ssr/GearSix";
import { useRouter } from "next/navigation";
import { SidebarSimple } from "@phosphor-icons/react/dist/ssr/SidebarSimple";
import { usePathname } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { useUserStore } from "@/app/store/userStore";

const SidebarButton = ({
  children,
  icon,
  active,
  open,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  open: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl h-[66px] overflow-hidden w-full whitespace-nowrap cursor-pointer flex gap-4 items-center  text-xl outline-none  p-5 ${
        active
          ? "text-zinc-900 bg-accent-green font-medium "
          : "text-inactive font-medium hover:bg-zinc-200 hover:text-zinc-900"
      }  transition-all duration-100`}
    >
      <div className="h-full w-fit shrink-0">{icon}</div>{" "}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

function Sidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  return (
    <motion.div
      initial={{ width: "320px" }}
      animate={{ width: open ? "320px" : "86px" }}
      className=" shrink-0 h-full flex flex-col rounded-xl border-2 border-border"
    >
      <div
        className="h-[84px] overflow-hidden
         text-3xl font-bold border-b-2 flex items-center  relative pl-6 border-border "
      >
        {/* <div className="size-full z-40 rounded-full border-[20px]   border-white mix-blend-difference absolute  " ></div> */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center shrink-0"
            >
              <motion.div
                className="translate-y-[-1px]"
                initial={{ rotateZ: "0deg" }}
                animate={{ rotateZ: "360deg" }}
                transition={{
                  duration: 8,
                  repeatType: "loop",
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <GearSix size={30} weight="fill" />
              </motion.div>
              <div className="z-20">UTWORKS</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-2 w-full  h-full flex  items-center absolute right-0 justify-end aspect-square ">
          <button
            onClick={() => setOpen((v) => !v)}
            className="h-full outline-none cursor-pointer aspect-square rounded-xl flex hover:bg-zinc-200 items-center justify-center"
          >
            <SidebarSimple weight={open ? "bold" : "fill"} size={24} />
          </button>
        </div>
      </div>
      <div className="h-fit flex flex-col w-full p-2 gap-2">
        <SidebarButton
          open={open}
          onClick={() => router.push("/dashboard")}
          active={pathname === "/dashboard"}
          icon={<House size={26} weight="bold" />}
        >
          Dashboard
        </SidebarButton>
        <SidebarButton
          open={open}
          onClick={() => router.push("/orders")}
          active={pathname === "/orders"}
          icon={<Package size={26} weight="bold" />}
        >
          Orders
        </SidebarButton>
        <SidebarButton
          open={open}
          onClick={() => router.push("/reports")}
          active={pathname === "/reports"}
          icon={<Files size={26} weight="bold" />}
        >
          Reports
        </SidebarButton>
        <SidebarButton
          open={open}
          onClick={() => router.push("/create-order")}
          active={pathname === "/create-order"}
          icon={<PlusCircle size={26} weight="bold" />}
        >
          Create Order
        </SidebarButton>
      </div>
      <div className="border-t-2 border-border h-[84px] overflow-hidden w-full mt-auto p-2 gap-4 flex">
        <div
          className="h-full aspect-square shrink-0
            rounded-lg bg-gradient-to-br from-accent to-accent-red relative overflow-hidden"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/3d_2.png"
            className="absolute left-0 top-0 size-full object-cover"
            alt=""
          />
        </div>
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full shrink-1 justify-center"
              >
                <div className="text-lg font-semibold leading-4">John Doe</div>
                <div className="font-medium text-inactive">
                  example@gmail.com
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <div className="p-2 w-full">
        <SidebarButton
          open={open}
          onClick={() => {useUserStore.getState().logout(); router.push("/login")}}
          active={false}
          icon={<SignOut size={26} weight="bold" />}
        >
          Log Out
        </SidebarButton>
      </div>
    </motion.div>
  );
}

export default Sidebar;
