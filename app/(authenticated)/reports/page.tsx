"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";
import { Download, FileText } from "@phosphor-icons/react";
import { useInventoryStore } from "@/app/store/inventoryStore";

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
      className={`rounded-xl outline-none border-2 gap-2 px-6 h-full w-fit font-medium cursor-pointer duration-100 text-xl flex items-center justify-between transition-colors
        ${isSelected ? "bg-accent-green/730 border-transparent text-black" : "bg-white hover:bg-zinc-200 border-border text-black/80"}
        ${className}`}
    >
      <div>{number}</div>
      <div>{title}</div>
    </button>
  );
};

const ReportCard = ({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border-2 border-border p-6 hover:bg-zinc-50 cursor-pointer transition-colors group"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-zinc-800 mb-2 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-accent font-medium">
        <span className="text-sm">Generate Report</span>
        <svg
          className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const { isLoggedIn } = useUserStore();
  const { productLedger, fetchProductLedger, loading, error } = useInventoryStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchProductLedger();
    }
  }, [isLoggedIn, router, fetchProductLedger]);

  const filters = [
    { number: 15, title: "Production" },
    { number: 8, title: "Inventory" },
    { number: 12, title: "Quality" },
    { number: 6, title: "Financial" },
    { number: 9, title: "Performance" },
    { number: 3, title: "Compliance" },
  ];
  const [mode, setMode] = useState("All Reports");

  const reportTypes = [
    {
      title: "Production Summary",
      description:
        "Overview of manufacturing orders, work orders completion rates, and production efficiency metrics",
      icon: "🏭",
      onClick: () => console.log("Generate Production Summary"),
    },
    {
      title: "Inventory Analysis",
      description:
        "Stock levels, material consumption, wastage analysis, and inventory turnover reports",
      icon: "📦",
      onClick: () => console.log("Generate Inventory Analysis"),
    },
    {
      title: "Quality Control",
      description:
        "Quality metrics, defect rates, inspection results, and compliance tracking reports",
      icon: "✅",
      onClick: () => console.log("Generate Quality Control"),
    },
    {
      title: "Cost Analysis",
      description:
        "Material costs, labor costs, overhead allocation, and profitability analysis by product",
      icon: "💰",
      onClick: () => console.log("Generate Cost Analysis"),
    },
    {
      title: "Performance Dashboard",
      description:
        "KPI tracking, OEE metrics, machine utilization, and workforce productivity reports",
      icon: "📊",
      onClick: () => console.log("Generate Performance Dashboard"),
    },
    {
      title: "Compliance Reports",
      description:
        "Regulatory compliance, safety reports, environmental impact, and audit trail documentation",
      icon: "📋",
      onClick: () => console.log("Generate Compliance Reports"),
    },
  ];

  return (
    <div className="h-fit w-full p-2 flex flex-col">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-zinc-900">
          Reports & Analytics
        </h1>
        <p className="text-zinc-600 mt-1">
          Generate comprehensive reports and analyze manufacturing performance
        </p>
      </div>

      {/* Search & Buttons */}
      <div className="w-full flex h-[66px] gap-2 items-center">
        <Button className="px-6 shrink-0 h-[calc(100%-4px)]">
          <Plus size={20} weight="regular" /> Custom Report
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
            placeholder="Search reports and templates..."
          />
        </div>
        <Button variant="secondary" className="px-6 h-full shrink-0">
          <Download size={20} weight="regular" /> Export All
        </Button>
        <Button variant="secondary" className="px-6 h-full shrink-0">
          <ArrowClockwise size={20} weight="regular" /> Reset
        </Button>
      </div>

      {/* Filter Cards */}
      <div className="h-[66px] mt-2 w-full flex gap-2">
        <Dropdown
          currentValue={mode}
          setValue={setMode}
          values={[
            "All Reports",
            "Recent Reports",
            "Scheduled Reports",
            "Favorites",
          ]}
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

      {/* Reports Grid */}
      <div className="w-full mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report, index) => (
          <ReportCard
            key={index}
            title={report.title}
            description={report.description}
            icon={report.icon}
            onClick={report.onClick}
          />
        ))}
      </div>

      {/* Recent Reports Section */}
      <div className="w-full mt-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Recent Reports
        </h2>
        <div className="bg-white rounded-xl border-2 border-border p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-2xl font-semibold text-zinc-800 mb-2">
              No Recent Reports
            </h3>
            <p className="text-zinc-600 mb-6">
              Generate your first report to start analyzing your manufacturing
              data
            </p>
            <div className="flex gap-3 justify-center">
              <Button className="px-6">
                <FileText size={20} weight="regular" /> Generate Report
              </Button>
              <Button variant="secondary" className="px-6">
                <Plus size={20} weight="regular" /> Schedule Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Ledger Section */}
      <div className="w-full mt-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">
          Product Ledger
        </h2>
        <div className="bg-white rounded-xl border-2 border-border p-8">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && productLedger.length === 0 && (
            <div>No Ledger Entries Yet</div>
          )}
          {!loading && !error && productLedger.length > 0 && (
            <div className="space-y-4">
              {productLedger.map((entry) => (
                <div key={entry.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-bold">Entry #{entry.id}</div>
                    <div>Product ID: {entry.productId}</div>
                    <div>Movement: {entry.movementType}</div>
                    <div>Quantity: {entry.quantity}</div>
                    <div>Date: {entry.createdAt ? String(entry.createdAt) : 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
