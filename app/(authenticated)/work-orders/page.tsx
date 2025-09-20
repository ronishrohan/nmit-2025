"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";
import { useWorkOrderStore } from "@/app/store/workOrderStore";

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
        ${isSelected ? "bg-accent-green/730 border-transparent text-black" : "bg-white hover:bg-zinc-200 border-border text-black/80"}
        ${className}`}
    >
      <div>{number}</div>
      <div>{title}</div>
    </button>
  );
};

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const { isLoggedIn } = useUserStore();
  const { workOrders, fetchWorkOrders, loading, error } = useWorkOrderStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchWorkOrders();
    }
  }, [isLoggedIn, router, fetchWorkOrders]);

  const filters = [
    { number: 4, title: "Pending" },
    { number: 8, title: "Ready" },
    { number: 6, title: "In Progress" },
    { number: 3, title: "Waiting" },
    { number: 2, title: "Done" },
    { number: 1, title: "Cancelled" },
  ];
  const [mode, setMode] = useState("All");

  return (
    <div className="h-fit w-full p-2 flex flex-col">
      {/* Page Title */}
      

      {/* Search & Buttons */}
      <div className="w-full flex h-[66px] gap-2 items-center">
        <Button className="px-6 shrink-0 h-[calc(100%-4px)]">
          <Plus size={20} weight="regular" /> New Work Order
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
            placeholder="Search work orders..."
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
          values={["All", "My Work Orders", "By Work Center", "By Employee"]}
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

      {/* Content Area */}
      <div className="w-full h-fit mt-2 bg-white rounded-xl border-2 border-border p-8">
        {loading && <div className="text-center text-lg">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && workOrders.length === 0 && (
          <div className="text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">No Work Orders Yet</h2>
            <p className="text-zinc-600 mb-6">Create work orders to assign specific operations to work centers and employees</p>
            <Button className="px-8">
              <Plus size={20} weight="regular" /> Create Work Order
            </Button>
          </div>
        )}
        {!loading && !error && workOrders.length > 0 && (
          <div className="space-y-4">
            {workOrders.map((order) => (
              <div key={order.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold">Work Order #{order.id}</div>
                  <div>Status: <span className="font-medium">{order.status}</span></div>
                  <div>Operation: {order.operation}</div>
                  <div>MO ID: {order.moId}</div>
                  <div>Created: {order.createdAt ? String(order.createdAt) : 'N/A'}</div>
                </div>
                <Button className="mt-2 md:mt-0" onClick={() => router.push(`/work-orders/${order.id}`)}>
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
