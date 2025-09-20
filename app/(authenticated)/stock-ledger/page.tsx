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
      <div className="w-full h-fit mt-2 bg-white rounded-xl border-2 border-border p-8">
        {loading && <div className="text-center text-lg">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && filteredStock.length === 0 && (
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">No Stock Entries Yet</h2>
            <p className="text-zinc-600 mb-6">Start tracking your inventory by creating stock entries and managing material movements</p>
            <Button className="px-8">
              <Plus size={20} weight="regular" /> Create Stock Entry
            </Button>
          </div>
        )}
        {!loading && !error && filteredStock.length > 0 && (
          <div className="space-y-4">
            {filteredStock.map((stock) => (
              <div key={stock.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold">Stock #{stock.id}</div>
                  <div>Product ID: {stock.productId}</div>
                  <div>Quantity: {stock.quantity}</div>
                  <div>Updated: {stock.updatedAt ? String(stock.updatedAt) : 'N/A'}</div>
                </div>
                <Button className="mt-2 md:mt-0" onClick={() => router.push(`/stock-ledger/${stock.id}`)}>
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
