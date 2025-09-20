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
import { useMoStore } from "@/app/store/moStore";
import { useProductStore } from "@/app/store/productStore";

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

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn, user } = useUserStore();
  const { workOrders, fetchWorkOrders, loading, error } = useWorkOrderStore();
  const { manufacturingOrders, fetchManufacturingOrders } = useMoStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchWorkOrders();
      fetchManufacturingOrders();
      fetchProducts();
    }
  }, [
    isLoggedIn,
    router,
    fetchWorkOrders,
    fetchManufacturingOrders,
    fetchProducts,
  ]);

  // Calculate counts for each filter dynamically
  const getFilterCounts = () => {
    const counts = {
      to_do: workOrders.filter((order) => order.status === "to_do").length,
      started: workOrders.filter((order) => order.status === "started").length,
      paused: workOrders.filter((order) => order.status === "paused").length,
      completed: workOrders.filter((order) => order.status === "completed")
        .length,
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  const filters = [
    { number: filterCounts.to_do, title: "To do", status: "to_do" },
    { number: filterCounts.started, title: "Started", status: "started" },
    { number: filterCounts.paused, title: "Paused", status: "paused" },
    { number: filterCounts.completed, title: "Completed", status: "completed" },
  ];
  const [mode, setMode] = useState("All");

  const filteredWorkOrders = workOrders.filter((order) => {
    const mo = manufacturingOrders.find((mo: any) => mo.id === order.moId);
    const product = mo
      ? products.find((p: any) => p.id === mo.productId)
      : undefined;
    // Status filter
    const statusMatch =
      selectedFilter !== null
        ? order.status === filters[selectedFilter].status
        : true;
    // Mode filter
    let modeMatch = true;
    if (mode === "My Work Orders" && user) {
      modeMatch = order.assignedToId === user.id;
    }
    // Search filter
    const searchMatch =
      order.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.moId.toString().includes(searchQuery) ||
      (product &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product && product.id.toString().includes(searchQuery));
    return statusMatch && modeMatch && searchMatch;
  });

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="secondary" className="px-6 h-full shrink-0">
          <ArrowClockwise size={20} weight="regular" /> Reset
        </Button>
      </div>

      {/* Filter Cards */}
      <div className="h-[66px] mt-2 w-full flex gap-2">
        {/* <Dropdown
          currentValue={mode}
          setValue={setMode}
          values={["All", "My Work Orders", "By Work Center", "By Employee"]}
        /> */}
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
      <div className="w-full h-fit mt-4 bg-white rounded-xl overflow-hidden border-2 border-border ">
        {/* Loading state */}
        {loading && (
          <div className="p-6 text-center text-lg text-zinc-600 animate-pulse">
            Loading work orders...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-6 text-center text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredWorkOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
              No Work Orders Yet
            </h2>
            <p className="text-zinc-600 mb-6 max-w-md">
              Create work orders to assign specific operations to work centers
              and employees.
            </p>
            <Button className="px-8 py-3 text-lg">
              <Plus size={20} weight="regular" className="mr-2" /> Create Work
              Order
            </Button>
          </div>
        )}

        {!loading && !error && filteredWorkOrders.length > 0 && (
          <div className="divide-y divide-border">
            {filteredWorkOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="text-xl font-bold text-zinc-800">
                    {order.operation}
                  </div>
                  <div className="text-zinc-700">
                    <span className="font-medium">WO:</span> #{order.id}
                  </div>
                  <div className="text-zinc-700">
                    <span className="font-medium">Status:</span>{" "}
                    {order.status.replace("_", " ").charAt(0).toUpperCase() +
                      order.status.replace("_", " ").slice(1)}
                  </div>
                  <div className="text-zinc-700">
                    <span className="font-medium">MO ID:</span> {order.moId}
                  </div>
                  <div className="text-zinc-500 text-sm">
                    Created:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </div>
                </div>

                {/* Right Side Button */}
                <Button
                  className="mt-auto"
                  onClick={() => router.push(`/work-orders/${order.id}`)}
                >
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
