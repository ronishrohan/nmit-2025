"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/app/store/productStore";
import { stockApi } from "@/app/api/stockApi";
import Button from "@/app/components/ui/button/Button";
import Input from "@/app/components/ui/input/Input";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";

const NewStockEntryPage = () => {
  const router = useRouter();
  const { products, fetchProducts, loading: productsLoading, error: productsError } = useProductStore();
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!products.length) fetchProducts();
  }, [products.length, fetchProducts]);

  useEffect(() => {
    if (productId && products.length) {
      const prod = products.find((p) => String(p.id) === productId);
      setProductName(prod ? prod.name : "");
    } else {
      setProductName("");
    }
  }, [productId, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!productId || !quantity) {
      setError("Please select a product and enter quantity.");
      return;
    }
    setLoading(true);
    try {
      const res = await stockApi.recordMovement({ productId: Number(productId), quantity: Number(quantity) });
      if (res.status) {
        setSuccess("Stock entry created successfully.");
        setTimeout(() => router.push("/stock-ledger"), 1200);
      } else {
        setError(res.message || "Failed to create stock entry.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create stock entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl border-2 border-border mt-8">
      <h1 className="text-2xl font-bold mb-4">New Stock Entry</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="font-medium">Product</label>
        {productsLoading ? (
          <div className="text-gray-500">Loading products...</div>
        ) : productsError ? (
          <div className="text-red-500">{productsError}</div>
        ) : (
          <Dropdown
            width={460}
            currentValue={productName || "Select a product"}
            setValue={(name: string) => {
              setProductName(name);
              const prod = products.find((p) => p.name === name);
              setProductId(prod ? String(prod.id) : "");
            }}
            values={products.map((p) => p.name)}
          />
        )}
        <label className="font-medium">Quantity</label>
        <Input
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="Enter quantity"
        />
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <Button disabled={loading} className="w-full">
          {loading ? "Saving..." : "Create Stock Entry"}
        </Button>
        <Button variant="secondary" onClick={() => router.push("/stock-ledger")}>Cancel</Button>
      </form>
    </div>
  );
};

export default NewStockEntryPage;
