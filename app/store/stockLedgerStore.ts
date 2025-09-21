import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getStockLedger } from "@/app/api/stockApi";
import { useUserStore } from "@/app/store/userStore";

export interface StockLedgerProduct {
  id: number;
  productId: number;
  quantity: number;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    description: string;
    unit: string;
  };
}

interface StockLedgerState {
  data: StockLedgerProduct[];
  loading: boolean;
  error: string | null;
  fetchStockLedger: () => Promise<void>;
}

export const useStockLedgerStore = create<StockLedgerState>()(
  persist(
    (set, get) => ({
      data: [],
      loading: false,
      error: null,
      fetchStockLedger: async () => {
        set({ loading: true, error: null });
        try {
          const token = useUserStore.getState().token || undefined;
          const res = await getStockLedger(token);
          set({ data: (res.data ?? []) as StockLedgerProduct[], loading: false });
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch stock ledger", loading: false });
        }
      },
    }),
    { name: "stock-ledger-store" }
  )
);
