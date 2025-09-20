"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { useBOMStore } from "@/app/store/bomStore";
import { useProductStore } from "@/app/store/productStore";

const Page = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn } = useUserStore();
  const { billOfMaterials, fetchBillOfMaterials, loading, error } = useBOMStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchBillOfMaterials();
      fetchProducts(); // Fetch products for name lookup
    }
  }, [isLoggedIn, router, fetchBillOfMaterials, fetchProducts]);

  // Filter and search logic
  const filteredBOMs = billOfMaterials.filter(bom => {
    const product = products.find((p) => p.id === bom.productId);
    return (
      bom.productId.toString().includes(searchQuery) ||
      bom.componentId.toString().includes(searchQuery) ||
      (product && product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="h-fit w-full p-2 flex flex-col">
      
      {/* Search & Buttons */}
      <div className="w-full flex h-[66px] gap-2 items-center">
        <Button className="px-6 shrink-0 h-[calc(100%-4px)]">
          <Plus size={20} weight="regular" /> New BOM
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
            placeholder="Search bill of materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        {!loading && !error && filteredBOMs.length === 0 && (
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">No Bill of Materials Yet</h2>
            <p className="text-zinc-600 mb-6">Create your first BOM to define product structures and material requirements</p>
            <Button className="px-8">
              <Plus size={20} weight="regular" /> Create Bill of Materials
            </Button>
          </div>
        )}
        {!loading && !error && filteredBOMs.length > 0 && (
          <div className="space-y-4">
            {filteredBOMs.map((bom) => {
              const product = products.find((p) => p.id === bom.productId);
              return (
                <div key={bom.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-bold">BOM #{bom.id}</div>
                    <div>Product: {product ? `${product.name} (ID: ${product.id})` : `ID: ${bom.productId}`}</div>
                    <div>Component ID: {bom.componentId}</div>
                    <div>Quantity: {bom.quantity}</div>
                    <div>Created: {bom.createdAt ? String(bom.createdAt) : 'N/A'}</div>
                  </div>
                  <Button className="mt-2 md:mt-0" onClick={() => router.push(`/bom/${bom.id}`)}>
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
