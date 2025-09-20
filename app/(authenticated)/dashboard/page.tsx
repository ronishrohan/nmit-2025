"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import React, { useEffect, useState } from "react";
import ProductionTable, { Column } from "./Table";
import { getOrders } from "@/app/database/orders.database";
import { motion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";

type FilterCardProps = {
  number: number | string;
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
};

const FilterCard = ({
  number,
  title,
  isSelected,
  onClick,
  className,
}: FilterCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl outline-none border-2 gap-2 px-6 h-full w-fit font-medium cursor-pointer duration-100 text-xl flex items-center justify-between transition-colors
        ${
          isSelected
            ? "bg-accent-green/730 border-transparent text-black"
            : "bg-white hover:bg-zinc-200 border-border text-black/80"
        }
        ${className}`}
    >
      <div>{number}</div>
      <div>{title}</div>
    </button>
  );
};

interface Item {
  id: number;
  reference: string;
  startDate: string; // ISO date string like "2025-09-01"
  finishedProduct: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled"; // or string if you want flexibility
  quantity: number;
  unit: string; // e.g., "pcs", "kg"
  state: string; // e.g., "NY", "CA"
}

const columns: Column[] = [
  { key: "reference", label: "Reference" },
  { key: "startDate", label: "Start Date" },
  { key: "finishedProduct", label: "Finished Product" },
  { key: "status", label: "Status" },
  { key: "quantity", label: "Quantity" },
  { key: "unit", label: "Unit" },
  { key: "state", label: "State" },
];

const data: Item[] = [
  {
    id: 1,
    reference: "REF001",
    startDate: "2025-09-01",
    finishedProduct: "Widget A",
    status: "Completed",
    quantity: 100,
    unit: "pcs",
    state: "NY",
  },
  {
    id: 2,
    reference: "REF002",
    startDate: "2025-09-05",
    finishedProduct: "Widget B",
    status: "Processing",
    quantity: 250,
    unit: "pcs",
    state: "CA",
  },
  {
    id: 3,
    reference: "REF003",
    startDate: "2025-09-10",
    finishedProduct: "Widget C",
    status: "Pending",
    quantity: 50,
    unit: "pcs",
    state: "TX",
  },
  {
    id: 4,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "Cancelled",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 5,
    reference: "REF005",
    startDate: "2025-09-15",
    finishedProduct: "Widget E",
    status: "Completed",
    quantity: 120,
    unit: "pcs",
    state: "WA",
  },
];

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const { isLoggedIn } = useUserStore();
  useEffect(() => {
    getOrders().then((data) => {
      console.log(data);
    });
  }, []);

  const filters = [
    { number: 2, title: "Draft" },
    { number: 5, title: "Confirmed" },
    { number: 3, title: "In-Progress" },
    { number: 1, title: "To Close" },
    { number: 4, title: "Not Assigned" },
    { number: 6, title: "Late" },
  ];
  const [mode, setMode] = useState("Mine");

  return (
    <div className="h-fit w-full p-2 flex flex-col">
      {/* Search & Buttons */}
      <div className="w-full flex h-[66px] gap-2 items-center">
        <Button
          onClick={() => router.push("/create-order")}
          className="px-6 shrink-0 h-[calc(100%-4px)]"
        >
          <Plus size={20} weight="regular" /> Create Order
        </Button>
        <div className="h-full w-full bg-white rounded-xl group border-2 focus-within:border-accent transition-colors duration-150 border-border flex relative">
          <MagnifyingGlass
            weight="bold"
            size={20}
            className="text-zinc-500 group-focus-within:text-accent h-full mx-3 absolute aspect-square pointer-events-none shrink-0"
          />
          <input
            type="text"
            className="size-full outline-none pl-10 text-xl font-medium"
            placeholder="Search"
          />
        </div>
        <Button variant="secondary" className="px-6 h-full shrink-0">
          <ArrowClockwise size={20} weight="regular" /> Reset
        </Button>
      </div>

      {/* Filter Cards */}
      <div className="h-[66px] mt-2 w-full flex gap-2">
        <Dropdown
          currentValue={mode}
          setValue={setMode}
          values={["All", "Mine"]}
        />
        {filters.map((filter, index) => (
          <FilterCard
            key={index}
            number={filter.number}
            title={filter.title}
            isSelected={selectedFilter === index}
            onClick={() => {
              if (selectedFilter == index) {
                setSelectedFilter(null);
              } else {
                setSelectedFilter(index);
              }
            }}
          />
        ))}
      </div>
      <div className="w-full h-fit border-2 border-border mt-2 bg-white flex flex-col rounded-xl overflow-hidden">
        <div className="text-3xl p-4 px-6 flex w-full justify-between h-[70px] items-center relative">
          <div>Orders</div>{" "}
          <div className="absolute p-2 right-0 top-0 h-full aspect-square shrink-0">
            <button onClick={() => router.push("/manufacturing-orders")} className="size-full cursor-pointer  rounded-lg border-2 border-border/50  hover:bg-zinc-200 flex items-center justify-center transition-colors duration-100">
              <ArrowUpRight size={24} />
            </button>
          </div>
        </div>
        <ProductionTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Page;
