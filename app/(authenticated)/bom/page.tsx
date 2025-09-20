"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";
import { useBOMStore } from "@/app/store/bomStore";

type FilterCardProps = {
  number: number | string;
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
};

const FilterCard = ({
  number,
  title,
  isSelected,
  onClick,
  className,
}: FilterCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl outline-none border-2 gap-2 px-6 h-full w-fit font-medium cursor-pointer duration-100 text-xl flex items-center justify-between
        ${isSelected ? "bg-accent-green/730 border-transparent text-black" : "bg-white hover:bg-zinc-200 border-border text-black/80"}
        ${className}`}
    >
      <div>{number}</div>
      <div>{title}</div>
    </button>
  );
};

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const { isLoggedIn } = useUserStore();
  const { billOfMaterials, fetchBillOfMaterials, loading, error } = useBOMStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchBillOfMaterials();
    }
  }, [isLoggedIn, router, fetchBillOfMaterials]);

  const filters = [
    { number: 5, title: "Active" },
    { number: 2, title: "Draft" },
    { number: 8, title: "Under Review" },
    { number: 3, title: "Approved" },
    { number: 1, title: "Archived" },
    { number: 4, title: "Outdated" },
  ];
  const [mode, setMode] = useState("All");

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
          />
        </div>
        <Button variant="secondary" className="px-6 h-full shrink-0">
          <ArrowClockwise size={20} weight="regular" /> Reset
        </Button>
      </div>

      {/* Filter Cards */}
      <div className="h-[66px] mt-2 w-full flex gap-2">
        <Dropdown
          currentValue={mode}
          setValue={setMode}
          values={["All", "My BOMs", "By Product", "By Category"]}
        />
        {filters.map((filter, index) => (
          <FilterCard
            key={index}
            number={filter.number}
            title={filter.title}
            isSelected={selectedFilter === index}
            onClick={() => {
              if (selectedFilter == index) {
                setSelectedFilter(null);
              } else {
                setSelectedFilter(index);
              }
            }}
          />
        ))}
      </div>

      {/* Content Area */}
      <div className="w-full h-fit mt-2 bg-white rounded-xl border-2 border-border p-8">
        {loading && <div className="text-center text-lg">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && billOfMaterials.length === 0 && (
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">No Bill of Materials Yet</h2>
            <p className="text-zinc-600 mb-6">Create your first BOM to define product structures and material requirements</p>
            <Button className="px-8">
              <Plus size={20} weight="regular" /> Create Bill of Materials
            </Button>
          </div>
        )}
        {!loading && !error && billOfMaterials.length > 0 && (
          <div className="space-y-4">
            {billOfMaterials.map((bom) => (
              <div key={bom.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold">BOM #{bom.id}</div>
                  <div>Product ID: {bom.productId}</div>
                  <div>Component ID: {bom.componentId}</div>
                  <div>Quantity: {bom.quantity}</div>
                  <div>Created: {bom.createdAt ? String(bom.createdAt) : 'N/A'}</div>
                </div>
                <Button className="mt-2 md:mt-0" onClick={() => router.push(`/bom/${bom.id}`)}>
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
