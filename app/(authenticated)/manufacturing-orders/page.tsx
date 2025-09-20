"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";
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
      className={`rounded-xl outline-none border-2 gap-2 px-6 h-full w-fit font-medium cursor-pointer duration-100 text-xl flex items-center justify-between
        ${
          isSelected
            ? "bg-accent-green/730 border-transparent text-black"
            : "bg-white hover:bg-zinc-200 border-border text-black/80"
        }
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
  const { manufacturingOrders, fetchManufacturingOrders, loading, error } =
    useMoStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchManufacturingOrders();
      fetchProducts(); // Fetch products for name lookup
    }
  }, [isLoggedIn, router, fetchManufacturingOrders, fetchProducts]);

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
      done: manufacturingOrders.filter((order) => order.status === "done")
        .length,
      cancelled: manufacturingOrders.filter(
        (order) => order.status === "cancelled"
      ).length,
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  const filters = [
    { number: filterCounts.draft, title: "Draft", status: "draft" },
    { number: filterCounts.confirmed, title: "Confirmed", status: "confirmed" },
    {
      number: filterCounts.in_progress,
      title: "In progress",
      status: "in_progress",
    },
    { number: filterCounts.to_close, title: "To close", status: "to_close" },
    { number: filterCounts.done, title: "Done", status: "done" },
    { number: filterCounts.cancelled, title: "Cancelled", status: "cancelled" },
  ];
  const [mode, setMode] = useState("All");

  const filteredOrders = manufacturingOrders.filter((order) => {
    const product = products.find((p) => p.id === order.productId);
    // Status filter
    const statusMatch =
      selectedFilter !== null
        ? order.status === filters[selectedFilter].status
        : true;
    // Mode filter
    let modeMatch = true;
    if (mode === "My Orders" && user) {
      modeMatch = order.createdById === user.id;
    } else if (mode === "Assigned to Me" && user) {
      modeMatch = order.assignedToId === user.id;
    }
    // Search filter
    const searchMatch =
      order.id.toString().includes(searchQuery) ||
      order.productId?.toString().includes(searchQuery) ||
      (product &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.quantity?.toString().includes(searchQuery);
    return statusMatch && modeMatch && searchMatch;
  });

  return (
    <div className="h-fit w-full p-2 flex flex-col">
      {/* Search & Buttons */}
      <div className="w-full flex h-[66px] gap-2 items-center">
        <div className="h-full w-full bg-white rounded-xl group border-2 focus-within:border-accent transition-colors duration-150 border-border flex relative">
          <MagnifyingGlass
            weight="bold"
            size={20}
            className="text-zinc-500 group-focus-within:text-accent h-full mx-3 absolute aspect-square pointer-events-none shrink-0"
          />
          <input
            type="text"
            className="size-full outline-none pl-10 text-xl font-medium"
            placeholder="Search manufacturing orders..."
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
        <Dropdown
          currentValue={mode}
          setValue={setMode}
          width={240}
          values={["All", "My Orders", "Assigned to me"]}
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
      <div className="w-full h-fit mt-2 bg-white rounded-xl border-2 border-border">
        {loading && <div className="text-center text-lg">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
              No Manufacturing Orders Yet
            </h2>
            <p className="text-zinc-600 mb-6">
              Create your first manufacturing order to get started
            </p>
            <Button
              onClick={() => router.push("/create-order")}
              className="px-8"
            >
              <Plus size={20} weight="regular" /> Create Manufacturing Order
            </Button>
          </div>
        )}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="divide-y divide-border">
            {filteredOrders.map((order) => {
              const product = products.find((p) => p.id === order.productId);
              return (
                <div
                  key={order.id}
                  className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hover:bg-zinc-50 transition-colors"
                >
                  {/* Left Side Details */}
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-zinc-800">
                      {product
                        ? product.name
                        : `Product ID: ${order.productId}`}
                    </div>
                    <div className="text-zinc-700">
                      <span className="font-medium">MO:</span> #{order.id}
                    </div>
                    <div className="text-zinc-700">
                      <span className="font-medium">Quantity:</span>{" "}
                      {order.quantity}
                    </div>
                    <div className="text-zinc-700">
                      <span className="font-medium">Status:</span>{" "}
                      {order.status.replace("_", " ").charAt(0).toUpperCase() +
                        order.status.replace("_", " ").slice(1)}
                    </div>
                    <div className="text-zinc-500 text-sm">
                      Created:{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "N/A"}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "N/A"}
                    </div>
                  </div>

                  {/* Right Side Button */}
                  <Button
                    className="mt-auto"
                    onClick={() =>
                      router.push(`/manufacturing-orders/${order.id}`)
                    }
                  >
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
