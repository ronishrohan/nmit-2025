"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { Kanban } from "@phosphor-icons/react/dist/ssr/Kanban";
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
  status: "Draft" | "Confirmed" | "In-Progress" | "To Close" | "Done"; // Updated to match kanban columns
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
    status: "Done",
    quantity: 100,
    unit: "pcs",
    state: "NY",
  },
  {
    id: 2,
    reference: "REF002",
    startDate: "2025-09-05",
    finishedProduct: "Widget B",
    status: "In-Progress",
    quantity: 250,
    unit: "pcs",
    state: "CA",
  },
  {
    id: 3,
    reference: "REF003",
    startDate: "2025-09-10",
    finishedProduct: "Widget C",
    status: "Draft",
    quantity: 50,
    unit: "pcs",
    state: "TX",
  },
  {
    id: 7,
    reference: "REF007",
    startDate: "2025-09-10",
    finishedProduct: "Widget C",
    status: "To Close",
    quantity: 50,
    unit: "pcs",
    state: "TX",
  },
  {
    id: 4,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 4,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 4,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 4,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 4,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 4,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 5,
    reference: "REF005",
    startDate: "2025-09-15",
    finishedProduct: "Widget E",
    status: "Confirmed",
    quantity: 120,
    unit: "pcs",
    state: "WA",
  },
  {
    id: 5,
    reference: "REF005",
    startDate: "2025-09-15",
    finishedProduct: "Widget E",
    status: "Confirmed",
    quantity: 120,
    unit: "pcs",
    state: "WA",
  },
  {
    id: 5,
    reference: "REF005",
    startDate: "2025-09-15",
    finishedProduct: "Widget E",
    status: "Confirmed",
    quantity: 120,
    unit: "pcs",
    state: "WA",
  },
];

// Kanban View Component
const KanbanCard = ({ item }: { item: Item }) => {
  return (
    <div className="bg-white border-2 border-border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="font-medium text-lg mb-2">{item.reference}</div>
      <div className="text-sm text-gray-600 mb-1">{item.finishedProduct}</div>
      <div className="text-sm text-gray-500 mb-2">Start: {item.startDate}</div>
      <div className="flex justify-between items-center">
        <span className="text-sm">
          {item.quantity} {item.unit}
        </span>
        <span className="text-sm text-gray-500">{item.state}</span>
      </div>
    </div>
  );
};

const KanbanColumn = ({
  title,
  items,
  color,
}: {
  title: string;
  items: Item[];
  color: string;
}) => {
  return (
    <div className="flex-1 min-w-0">
      <div className={`rounded-lg p-4 mb-4 ${color}`}>
        <h3 className="font-medium text-lg text-white">{title}</h3>
        <span className="text-white/80 text-sm">({items.length})</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const KanbanView = ({ data }: { data: Item[] }) => {
  const columns = [
    { title: "Draft", status: "Draft" as const, color: "bg-gray-500" },
    { title: "Confirmed", status: "Confirmed" as const, color: "bg-[#33A7FF]" },
    {
      title: "In-Progress",
      status: "In-Progress" as const,
      color: "bg-yellow-400",
    },
    { title: "To Close", status: "To Close" as const, color: "bg-accent-red" },
    { title: "Done", status: "Done" as const, color: "bg-[#99C24D]" },
  ];

  // Filter out columns that have no items
  const visibleColumns = columns.filter((column) =>
    data.some((item) => item.status === column.status)
  );

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {visibleColumns.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          items={data.filter((item) => item.status === column.status)}
          color={column.color}
        />
      ))}
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
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
        <Button
          variant="secondary"
          className="px-4 h-full shrink-0 aspect-square flex items-center justify-center"
          onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
        >
          {viewMode === "list" ? (
            <>
              <Kanban size={20} weight="regular" />
            </>
          ) : (
            <>
              <List size={20} weight="regular" />
            </>
          )}
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
      <div className="w-full max-h-[50vh] border-2 border-border mt-2 bg-white flex flex-col rounded-xl overflow-hidden">
        <div className="text-3xl p-4 px-6 flex w-full justify-between h-[70px] items-center relative">
          <div>Manufacturing Orders</div>{" "}
          <div className="absolute p-2 right-0 top-0 h-full aspect-square shrink-0">
            <button
              onClick={() => router.push("/manufacturing-orders")}
              className="size-full cursor-pointer  rounded-lg border-2 border-border/50  hover:bg-zinc-200 flex items-center justify-center transition-colors duration-100"
            >
              <ArrowUpRight size={24} />
            </button>
          </div>
        </div>
        {viewMode === "list" ? (
          <ProductionTable columns={columns} data={data} />
        ) : (
          <KanbanView data={data} />
        )}
      </div>
    </div>
  );
};

export default Page;
