"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkOrderStore } from "@/app/store/workOrderStore";
import { useMoStore } from "@/app/store/moStore";
import { useProductStore } from "@/app/store/productStore";

const WorkOrderDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { currentWorkOrder, fetchWorkOrderById, loading, error } = useWorkOrderStore();
  const { manufacturingOrders, fetchManufacturingOrders } = useMoStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchWorkOrderById(Number(id));
      fetchManufacturingOrders();
      fetchProducts();
    }
  }, [id, fetchWorkOrderById, fetchManufacturingOrders, fetchProducts]);

  let productName = "";
  let productId = "";
  let operation = "";
  let durationMins = "";

  if (currentWorkOrder) {
    const mo = manufacturingOrders.find((mo) => mo.id === currentWorkOrder.moId);
    if (mo) {
      const product = products.find((p) => p.id === mo.productId);
      if (product) {
        productName = product.name;
        productId = String(product.id); // Fix: ensure string
      }
    }
    operation = currentWorkOrder.operation;
    durationMins = String(currentWorkOrder.durationMins); // Fix: ensure string
  }

  return (
    <div className="p-2 size-full">
      <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2">
        {loading && <div className="text-lg">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && !currentWorkOrder && (
          <div className="text-lg">Work order not found.</div>
        )}
        {!loading && !error && currentWorkOrder && (
          <>
            <div className="bg-background p-5 px-8 text-2xl font-mono text-inactive rounded-lg w-fit">
              WO - {String(currentWorkOrder.id).padStart(6, "0")}
            </div>
            <div>Product: {productName} (ID: {productId})</div>
            <div>Operation: {operation}</div>
            <div>Duration (mins): {durationMins}</div>
            <div>Status: <span className="font-semibold">{currentWorkOrder.status}</span></div>
            <div>Started: {currentWorkOrder.startedAt ? String(currentWorkOrder.startedAt) : "N/A"}</div>
            <div>Completed: {currentWorkOrder.completedAt ? String(currentWorkOrder.completedAt) : "N/A"}</div>
            <div>Created: {currentWorkOrder.createdAt ? String(currentWorkOrder.createdAt) : "N/A"}</div>
            <button className="mt-4 px-4 py-2 bg-zinc-200 rounded" onClick={() => router.back()}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkOrderDetailsPage;
