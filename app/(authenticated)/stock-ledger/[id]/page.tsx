"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStockLedgerStore } from "@/app/store/stockLedgerStore";
import Button from "@/app/components/ui/button/Button";

const StockLedgerDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: stockLedger, fetchStockLedger, loading, error } = useStockLedgerStore();

  useEffect(() => {
    if (!stockLedger.length) {
      fetchStockLedger();
    }
  }, [stockLedger.length, fetchStockLedger]);

  const stock = stockLedger.find((s) => s.id === Number(id));

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && stock && (
        <div className="bg-white rounded-xl border-2 border-border p-6 flex flex-col gap-4">
          <h1 className="text-3xl font-bold mb-2">{stock.product.name}</h1>
          <div className="text-lg font-bold text-zinc-800 mb-2">Stock #{stock.id}</div>
          <div className="text-zinc-700 mb-1">
            <span className="font-medium">Description:</span> {stock.product.description}
          </div>
          <div className="text-zinc-700 mb-1">
            <span className="font-medium">Quantity:</span> {stock.quantity} {stock.product.unit}
          </div>
          <div className="text-zinc-500 text-sm mb-1">
            Updated: {stock.updatedAt ? new Date(stock.updatedAt).toLocaleString() : "N/A"}
          </div>
          <Button onClick={() => router.back()} variant="secondary" className="w-fit mt-4">Back to Stock Ledger</Button>
        </div>
      )}
      {!loading && !error && !stock && (
        <div className="text-gray-500">Stock entry not found.</div>
      )}
    </div>
  );
};

export default StockLedgerDetailPage;
