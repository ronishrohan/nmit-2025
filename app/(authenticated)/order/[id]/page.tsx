"use client";

import Input from "@/app/components/ui/input/Input";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMoStore } from "@/app/store/moStore";
import { useProductStore } from "@/app/store/productStore";
import { useBOMStore } from "@/app/store/bomStore";

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const { currentOrder, fetchManufacturingOrderById, loading, error } =
    useMoStore();
  const { products, fetchProducts } = useProductStore();
  const { billOfMaterials, fetchBillOfMaterials } = useBOMStore();

  useEffect(() => {
    if (id) {
      fetchManufacturingOrderById(Number(id));
      fetchProducts();
      fetchBillOfMaterials();
    }
  }, [id, fetchManufacturingOrderById, fetchProducts, fetchBillOfMaterials]);

  let productName = "";
  let productId = "";
  let productBOM: typeof billOfMaterials = [];
  if (currentOrder) {
    const product = products.find((p) => p.id === currentOrder.productId);
    if (product) {
      productName = product.name;
      productId = String(product.id);
    }
    productBOM = billOfMaterials.filter(
      (bom) => bom.productId === currentOrder.productId
    );
  }

  return (
    <div className="p-2 size-full">
      <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2">
        {loading && <div className="text-lg">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && !currentOrder && (
          <div className="text-lg">Order not found.</div>
        )}
        {!loading && !error && currentOrder && (
          <>
            <div className="bg-background p-5 px-8 text-2xl font-mono text-inactive rounded-lg w-fit">
              MO - {String(currentOrder.id).padStart(6, "0")}
            </div>
            <div>
              Product: {productName} (ID: {productId})
            </div>
            <Input
              value={
                currentOrder.quantity ? String(currentOrder.quantity) : ""
              }
              disabled
              placeholder="Quantity"
              type="number"
              className="py-4"
            />
            <div>
              Status:{" "}
              <span className="font-semibold">{currentOrder.status}</span>
            </div>
            <div>
              Created:{" "}
              {currentOrder.createdAt ? String(currentOrder.createdAt) : "N/A"}
            </div>
            <div>
              Updated:{" "}
              {currentOrder.updatedAt ? String(currentOrder.updatedAt) : "N/A"}
            </div>
            <div>Assigned To: {currentOrder.assignedToId ?? "N/A"}</div>
            <div>
              Schedule Start:{" "}
              {currentOrder.scheduleStartDate
                ? String(currentOrder.scheduleStartDate)
                : "N/A"}
            </div>
            <div>
              Deadline:{" "}
              {currentOrder.deadline ? String(currentOrder.deadline) : "N/A"}
            </div>
            {/* BOM Section */}
            <div className="mt-6">
              <div className="font-bold mb-2">Bill of Materials</div>
              {productBOM.length === 0 ? (
                <div className="text-zinc-500">
                  No BOM found for this product.
                </div>
              ) : (
                <ul className="list-disc pl-6">
                  {productBOM.map((bom) => (
                    <li key={bom.id}>
                      Component:{" "}
                      {bom.component?.name || bom.componentId} | Qty: {bom.quantity}{" "}
                      {bom.component?.unit || ""}{" "}
                      {bom.operation ? `| Operation: ${bom.operation}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-zinc-200 rounded"
              onClick={() => router.back()}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
