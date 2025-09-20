import axios from "axios";
import { useUserStore } from "@/app/store/userStore";

// Helper to get token from zustand user store
function getTokenFromStore() {
  // This works in React context; for non-React, pass token as argument
  return useUserStore.getState().token;
}

// Simple stock and product ledger API for debugging

export async function fetchStockLedger() {
  const token = getTokenFromStore();
  const res = await axios.get("http://172.17.54.86:3000/api/stock/ledger", {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}

export async function fetchProductLedger(productId: number) {
  const token = getTokenFromStore();
  const res = await axios.get(
    `http://172.17.54.86:3000/api/stock/${productId}/ledger`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return res.data;
}
