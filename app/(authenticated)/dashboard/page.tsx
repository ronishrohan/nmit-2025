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
import { useMoStore } from "@/app/store/moStore";
import { CaretDoubleUp } from "@phosphor-icons/react/dist/ssr/CaretDoubleUp";
import { ManufacturingOrder, OrderStatus } from "@/app/types";

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

// Kanban View Component
const KanbanCard = ({ order }: { order: ManufacturingOrder }) => {
  const router = useRouter();

  // Format date helper
  const formatDate = (date?: Date) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString();
  };

  return (
    <button
      onClick={() => router.push("/manufacturing-orders/" + order.id)}
      className="bg-white border-2 w-full items-start text-left cursor-pointer border-border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
    >
      <div className="font-medium text-lg mb-2">
        MO-{order.id?.toString().padStart(6, "0")}
      </div>
      <div className="text-sm text-gray-600 mb-1">
        {order.product?.name || "Unknown Product"}
      </div>
      <div className="text-sm text-gray-500 mb-2">
        Start: {formatDate(order.scheduleStartDate)}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">
          {order.quantity || 0} {order.product?.unit || "Units"}
        </span>
        <span className="text-sm text-gray-500 capitalize">
          {order.status?.replace("_", " ")}
        </span>
      </div>
      {order.assignedTo && (
        <div className="text-xs text-gray-400 mt-1">
          Assigned: {order.assignedTo.fullName}
        </div>
      )}
    </button>
  );
};

const KanbanColumn = ({
  title,
  orders,
  color,
}: {
  title: string;
  orders: ManufacturingOrder[];
  color: string;
}) => {
  return (
    <div className="flex-1 h-fit min-w-0">
      <div className={`rounded-lg sticky top-0 p-4 mb-4 ${color}`}>
        <h3 className="font-medium text-lg text-white">{title}</h3>
        <span className="text-white/80 text-sm">({orders.length})</span>
      </div>
      <div className="space-y-2">
        {orders.map((order) => (
          <KanbanCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

const KanbanView = ({ data }: { data: ManufacturingOrder[] }) => {
  const columns = [
    { title: "Draft", status: "draft" as const, color: "bg-gray-500" },
    { title: "Confirmed", status: "confirmed" as const, color: "bg-[#33A7FF]" },
    {
      title: "In-Progress",
      status: "in_progress" as const,
      color: "bg-yellow-400",
    },
    { title: "To Close", status: "to_close" as const, color: "bg-accent-red" },
    { title: "Done", status: "done" as const, color: "bg-[#99C24D]" },
  ];

  // Filter out columns that have no items
  const visibleColumns = columns.filter((column) =>
    data.some((order) => order.status === column.status)
  );

  return (
    <div className="w-full flex  overflow-auto">
      <div className="flex w-full gap-4  h-fit p-4">
        {visibleColumns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            orders={data.filter((order) => order.status === column.status)}
            color={column.color}
          />
        ))}
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const { isLoggedIn } = useUserStore();
  const { manufacturingOrders, fetchManufacturingOrders, loading, error } =
    useMoStore();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchManufacturingOrders();
    }
    console.log(manufacturingOrders);
  }, [isLoggedIn, router, fetchManufacturingOrders]);

  

  const [ordersHidden, setOrdersHidden] = useState(false);

  // Calculate counts for each filter dynamically
  const getFilterCounts = () => {
    const counts = {
      draft: manufacturingOrders.filter((order) => order.status === "draft")
        .length,
      confirmed: manufacturingOrders.filter(
        (order) => order.status === "confirmed"
      ).length,
      in_progress: manufacturingOrders.filter(
        (order) => order.status === "in_progress"
      ).length,
      to_close: manufacturingOrders.filter(
        (order) => order.status === "to_close"
      ).length,
      not_assigned: manufacturingOrders.filter((order) => !order.assignedToId)
        .length, // Orders without assignee
      late: manufacturingOrders.filter(
        (order) =>
          order.deadline &&
          new Date(order.deadline) < new Date() &&
          order.status !== "done" &&
          order.status !== "cancelled"
      ).length, // Orders past deadline and not completed
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  const filters = [
    { number: filterCounts.draft, title: "draft" },
    { number: filterCounts.confirmed, title: "confirmed" },
    { number: filterCounts.in_progress, title: "in_progress" },
    { number: filterCounts.to_close, title: "to_close" },
    { number: filterCounts.not_assigned, title: "not_assigned" },
    { number: filterCounts.late, title: "late" },
  ];
  const [mode, setMode] = useState("All");

  // Prepare columns for the table
  const columns: Column[] = [
    { key: "id", label: "Order ID" },
    { key: "status", label: "Status" },
    { key: "productId", label: "Product ID" },
    { key: "quantity", label: "Quantity" },
    { key: "createdAt", label: "Created At" },
  ];

  // Prepare base filtered data
  const baseFilteredData = manufacturingOrders
    .filter((order) => {
      if (selectedFilter === null) return true;
      const filterTitle = filters[selectedFilter].title;

      // Handle special filter cases
      if (filterTitle === "not_assigned") {
        return !order.assignedToId;
      }
      if (filterTitle === "late") {
        return (
          order.deadline &&
          new Date(order.deadline) < new Date() &&
          order.status !== "done" &&
          order.status !== "cancelled"
        );
      }

      // Handle regular status filters
      return order.status === filterTitle;
    })
    .filter((order) => {
      return (
        order.id?.toString().includes(searchQuery) ||
        order.productId?.toString().includes(searchQuery) ||
        order.status?.toString().includes(searchQuery) ||
        order.createdAt?.toString().includes(searchQuery)
      );
    });

  // Prepare data for the table with formatted dates
  const tableData = baseFilteredData.map((order) => ({
    ...order,
    createdAt: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not set",
  }));

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          values={["All", "My"]}
        />
        {viewMode === "list" && (
          <>
            <div className="flex gap-2">
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
          </>
        )}
      </div>
      <motion.div
        initial={{ height: "auto" }}
        animate={{ height: ordersHidden ? "72px" : "auto" }}
        className="w-full max-h-[50vh] border-2 border-border mt-2 bg-white flex flex-col rounded-xl overflow-hidden"
      >
        <div className="text-3xl p-4 px-6 flex w-full justify-between h-[70px] items-center relative">
          <div>Manufacturing Orders</div>{" "}
          <div className="flex h-[70px] w-fit absolute right-0 p-2 gap-2">
            <div className="right-0 top-0 h-full aspect-square shrink-0">
              <button
                onClick={() => router.push("/manufacturing-orders")}
                className="size-full cursor-pointer  rounded-lg border-2 border-border/50  hover:bg-zinc-200 flex items-center justify-center transition-colors duration-100"
              >
                <ArrowUpRight size={24} />
              </button>
            </div>
            <div className="right-0 top-0 h-full aspect-square shrink-0">
              <button
                onClick={() => setOrdersHidden((v) => !v)}
                className="size-full cursor-pointer  rounded-lg border-2 border-border/50  hover:bg-zinc-200 flex items-center justify-center transition-colors duration-100"
              >
                <motion.div
                  animate={{ rotateZ: ordersHidden ? "180deg" : "0deg" }}
                  transition={{ duration: 0.2, ease: "circInOut" }}
                >
                  <CaretDoubleUp size={24} />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
        {loading && <div className="text-center text-lg">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && baseFilteredData.length === 0 && (
          <div className="text-center py-8">No Orders Yet</div>
        )}
        {!loading && !error && baseFilteredData.length > 0 ? (
          viewMode === "list" ? (
            <ProductionTable columns={columns} data={tableData} />
          ) : (
            <KanbanView data={baseFilteredData} />
          )
        ) : (
          !loading &&
          !error && <div className="text-center py-8">No Orders Yet</div>
        )}
      </motion.div>
      <div className="h-[100dvh]"></div>
    </div>
  );
};

export default Page;
