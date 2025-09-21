"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { useBOMStore } from "@/app/store/bomStore";
import { useProductStore } from "@/app/store/productStore";
import Modal from "@/app/components/modal/Modal";
import BOMForm from "@/app/components/BOMForm";
import Fuse from "fuse.js";

const Page = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { isLoggedIn } = useUserStore();
  const { billOfMaterials, fetchBillOfMaterials, loading, error } =
    useBOMStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchBillOfMaterials();
      fetchProducts(); // Fetch products for name lookup
    }
  }, [isLoggedIn, router, fetchBillOfMaterials, fetchProducts]);

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: [
      { name: "productId", weight: 0.3 },
      { name: "componentId", weight: 0.3 },
      { name: "product.name", weight: 0.4 },
      { name: "component.name", weight: 0.4 },
      { name: "quantity", weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true,
    minMatchCharLength: 2,
    shouldSort: true,
  };

  // Filter and search logic using Fuse.js
  const filteredBOMs = useMemo(() => {
    if (!searchQuery.trim()) {
      return billOfMaterials;
    }

    const searchFuse = new Fuse(billOfMaterials, fuseOptions);
    const results = searchFuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [billOfMaterials, searchQuery, fuseOptions]);

  return (
    <>
      <Modal 
        open={modalOpen} 
        setOpen={setModalOpen}
        title="Create Bill of Material"
      >
        <BOMForm
          onSuccess={() => {
            setModalOpen(false);
            fetchBillOfMaterials(); // Refresh the list
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
            placeholder="Search products, components, quantities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          className="px-6 h-full shrink-0"
          onClick={() => {
            setSearchQuery("");
          }}
        >
          <ArrowClockwise size={20} weight="regular" /> Reset
        </Button>
      </div>

      {/* Content Area */}
      <div className="w-full h-fit mt-2 bg-white rounded-xl border-2 border-border ">
        {loading && <div className="text-center text-lg">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && filteredBOMs.length === 0 && (
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
              No Bill of Materials Yet
            </h2>
            <p className="text-zinc-600 mb-6">
              Create your first BOM to define product structures and material
              requirements
            </p>
            <Button 
              className="px-8"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={20} weight="regular" /> Create Bill of Materials
            </Button>
          </div>
        )}
        {!loading && !error && filteredBOMs.length > 0 && (
          <div className="divide-y divide-border">
            {filteredBOMs.map((bom) => {
              const product = products.find((p) => p.id === bom.productId);
              return (
                <div
                  key={bom.id}
                  className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hover:bg-zinc-50 transition-colors"
                >
                  {/* Left Side Details */}
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-zinc-800">
                      {product ? product.name : `Product ID: ${bom.productId}`}
                    </div>
                    <div className="text-zinc-700">
                      <span className="font-medium">BOM:</span> #{bom.id}
                    </div>
                    <div className="text-zinc-700">
                      <span className="font-medium">Component ID:</span>{" "}
                      {bom.componentId}
                    </div>
                    <div className="text-zinc-700">
                      <span className="font-medium">Quantity:</span>{" "}
                      {bom.quantity}
                    </div>
                    <div className="text-zinc-500 text-sm">
                      Created:{" "}
                      {bom.createdAt
                        ? new Date(bom.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </div>
                  </div>

                  {/* Right Side Button */}
                  <Button
                    className="mt-auto"
                    onClick={() => router.push(`/bom/${bom.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Page;
