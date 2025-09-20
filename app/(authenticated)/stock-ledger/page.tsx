"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";
import { useInventoryStore } from "@/app/store/inventoryStore";

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const { isLoggedIn } = useUserStore();
  const { productStock, fetchProductStock, loading, error } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchProductStock();
    }
  }, [isLoggedIn, router, fetchProductStock]);

  const filteredStock = productStock.filter(stock => {
    return (
      stock.productId.toString().includes(searchTerm) ||
      stock.id.toString().includes(searchTerm)
    );
  });

  return (
    <div className="h-fit w-full p-2 flex flex-col">
      {/* Search & Buttons */}
      <div className="w-full flex h-[66px] gap-2 items-center">
        <Button className="px-6 shrink-0 h-[calc(100%-4px)]">
          <Plus size={20} weight="regular" /> New Stock Entry
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
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary" className="px-6 h-full shrink-0">
          <ArrowClockwise size={20} weight="regular" /> Reset
        </Button>
      </div>

      {/* Content Area */}
      <div className="w-full h-fit mt-2 bg-white rounded-xl border-2 border-border ">{!loading && !error && filteredStock.length > 0 && (
  <div className="divide-y divide-y-border">
    {filteredStock.map((stock) => (
      <div
        key={stock.id}
        className=" p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hover:bg-zinc-50 transition-colors"
      >
        {/* Left Side Details */}
        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold text-zinc-800">Stock #{stock.id}</div>
          <div className="text-zinc-700">
            <span className="font-medium">Product:</span> {stock.productId}
          </div>
          <div className="text-zinc-700">
            <span className="font-medium">Quantity:</span> {stock.quantity}
          </div>
          <div className="text-zinc-500 text-sm">
            Updated:{" "}
            {stock.updatedAt
              ? new Date(stock.updatedAt).toLocaleString()
              : "N/A"}
          </div>
        </div>

        {/* Right Side Button */}
        <Button
          className="mt-auto"
          onClick={() => router.push(`/stock-ledger/${stock.id}`)}
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
