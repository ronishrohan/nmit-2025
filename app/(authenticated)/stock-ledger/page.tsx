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
import { useStockLedgerStore } from "@/app/store/stockLedgerStore";
import Modal from "@/app/components/modal/Modal";
import StockLedgerForm from "@/app/components/StockLedgerForm";

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { isLoggedIn } = useUserStore();
  const {
    data: stockLedger,
    fetchStockLedger,
    loading,
    error,
  } = useStockLedgerStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchStockLedger();
    }
  }, [isLoggedIn, router, fetchStockLedger]);

  const filteredStock = stockLedger.filter((stock) => {
    return (
      stock.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.productId.toString().includes(searchTerm) ||
      stock.id.toString().includes(searchTerm)
    );
  });

  return (
    <>
      <Modal
        open={modalOpen}
        setOpen={setModalOpen}
        title="Record Stock Movement"
      >
        <StockLedgerForm
          onSuccess={() => {
            setModalOpen(false);
            fetchStockLedger(); // Refresh the list
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <div className="h-fit w-full p-2 flex flex-col">
        {/* Search & Buttons */}
        <div className="w-full flex h-[66px] gap-2 items-center">
          <Button
            className="px-6 shrink-0 h-[calc(100%-4px)]"
            onClick={() => setModalOpen(true)}
          >
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
          <Button
            variant="secondary"
            className="px-6 h-full shrink-0"
            onClick={() => setSearchTerm("")}
          >
            <ArrowClockwise size={20} weight="regular" /> Reset
          </Button>
        </div>

        {/* Content Area */}
        <div className="w-full h-fit mt-2 bg-white rounded-xl border-2 border-border ">
          {loading && <div className="p-4">Loading stock ledger...</div>}
          {error && <div className="p-4 text-red-500">{error}</div>}
          {!loading && !error && filteredStock.length > 0 && (
            <div className="divide-y divide-y-border">
              {filteredStock.map((stock) => (
                <div
                  key={stock.id}
                  className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hover:bg-zinc-50 transition-colors"
                >
                  {/* Left Side Details */}
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-zinc-800">
                      {stock.product.name}
                    </h2>
                    <div className="text-zinc-700 font-bold">
                      Stock #{stock.id}
                    </div>
                    <div className="text-zinc-700">
                      <span className="font-medium">Description:</span>{" "}
                      {stock.product.description}
                    </div>
                    <div className="text-zinc-700">
                      <span className="font-medium">Quantity:</span>{" "}
                      {stock.quantity} {stock.product.unit}
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
          {!loading && !error && filteredStock.length === 0 && (
            <div className="p-4 text-gray-500">
              No stock ledger entries found.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
