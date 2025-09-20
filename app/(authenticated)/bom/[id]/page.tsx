"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBOMStore } from "@/app/store/bomStore";
import { useProductStore } from "@/app/store/productStore";

const BOMDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { currentBOM, fetchBOMById, loading, error } = useBOMStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchBOMById(Number(id));
      fetchProducts();
    }
  }, [id, fetchBOMById, fetchProducts]);

  let productName = "";
  let productId = "";
  let componentName = "";
  let componentId = "";
  if (currentBOM) {
    const product = products.find((p) => p.id === currentBOM.productId);
    if (product) {
      productName = product.name;
      productId = String(product.id);
    }
    const component = products.find((p) => p.id === currentBOM.componentId);
    if (component) {
      componentName = component.name;
      componentId = String(component.id);
    }
  }

  return (
    <div className="p-2 size-full">
      <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2">
        {loading && <div className="text-lg">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && !currentBOM && (
          <div className="text-lg">BOM not found.</div>
        )}
        {!loading && !error && currentBOM && (
          <>
            <div className="bg-background p-5 px-8 text-2xl font-mono text-inactive rounded-lg w-fit">
              BOM - {String(currentBOM.id).padStart(6, "0")}
            </div>
            <div>Product: {productName} (ID: {productId})</div>
            <div>Component: {componentName} (ID: {componentId})</div>
            <div>Quantity: {currentBOM.quantity}</div>
            <div>Operation: {currentBOM.operation || "N/A"}</div>
            <div>Created: {currentBOM.createdAt ? String(currentBOM.createdAt) : "N/A"}</div>
            <button className="mt-4 px-4 py-2 bg-zinc-200 rounded" onClick={() => router.back()}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BOMDetailsPage;
