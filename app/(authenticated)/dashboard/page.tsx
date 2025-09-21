"use client";
import Button from "@/app/components/ui/button/Button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { Kanban } from "@phosphor-icons/react/dist/ssr/Kanban";
import React, { useEffect, useState, useMemo } from "react";
import ProductionTable, { Column } from "./Table";
import { getOrders } from "@/app/database/orders.database";
import { motion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { useMoStore } from "@/app/store/moStore";
import { useProductStore } from "@/app/store/productStore";
import { CaretDoubleUp } from "@phosphor-icons/react/dist/ssr/CaretDoubleUp";
import { ManufacturingOrder, OrderStatus } from "@/app/types";
import Fuse from "fuse.js";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
        ${
          isSelected
            ? "bg-accent-green/730 border-transparent text-black"
            : "bg-white hover:bg-zinc-200 border-border text-black/80"
        }
        ${className}`}
    >
      <div>{number}</div>
      <div>{title}</div>
    </button>
  );
};

interface Item {
  id: number;
  reference: string;
  startDate: string; // ISO date string like "2025-09-01"
  finishedProduct: string;
  status: "Draft" | "Confirmed" | "In-Progress" | "To Close" | "Done"; // Updated to match kanban columns
  quantity: number;
  unit: string; // e.g., "pcs", "kg"
  state: string; // e.g., "NY", "CA"
}

const columns: Column[] = [
  { key: "reference", label: "Reference" },
  { key: "startDate", label: "Start Date" },
  { key: "finishedProduct", label: "Finished Product" },
  { key: "status", label: "Status" },
  { key: "quantity", label: "Quantity" },
  { key: "unit", label: "Unit" },
  { key: "state", label: "State" },
];

const data: Item[] = [
  {
    id: 1,
    reference: "REF001",
    startDate: "2025-09-01",
    finishedProduct: "Widget A",
    status: "Done",
    quantity: 100,
    unit: "pcs",
    state: "NY",
  },
  {
    id: 2,
    reference: "REF002",
    startDate: "2025-09-05",
    finishedProduct: "Widget B",
    status: "In-Progress",
    quantity: 250,
    unit: "pcs",
    state: "CA",
  },
  {
    id: 3,
    reference: "REF003",
    startDate: "2025-09-10",
    finishedProduct: "Widget C",
    status: "Draft",
    quantity: 50,
    unit: "pcs",
    state: "TX",
  },
  {
    id: 4,
    reference: "REF007",
    startDate: "2025-09-10",
    finishedProduct: "Widget C",
    status: "To Close",
    quantity: 50,
    unit: "pcs",
    state: "TX",
  },
  {
    id: 5,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 6,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 7,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 8,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 9,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 10,
    reference: "REF004",
    startDate: "2025-09-12",
    finishedProduct: "Widget D",
    status: "To Close",
    quantity: 75,
    unit: "pcs",
    state: "FL",
  },
  {
    id: 11,
    reference: "REF005",
    startDate: "2025-09-15",
    finishedProduct: "Widget E",
    status: "Confirmed",
    quantity: 120,
    unit: "pcs",
    state: "WA",
  },
  {
    id: 12,
    reference: "REF005",
    startDate: "2025-09-15",
    finishedProduct: "Widget E",
    status: "Confirmed",
    quantity: 120,
    unit: "pcs",
    state: "WA",
  },
  {
    id: 13,
    reference: "REF005",
    startDate: "2025-09-15",
    finishedProduct: "Widget E",
    status: "Confirmed",
    quantity: 120,
    unit: "pcs",
    state: "WA",
  },
];

// Kanban View Component
const KanbanCard = ({ order }: { order: ManufacturingOrder }) => {
  const router = useRouter();

  // Format date helper
  const formatDate = (date?: Date) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString();
  };

  return (
    <button
      onClick={() => router.push("/manufacturing-orders/" + order.id)}
      className="bg-white border-2 w-full items-start text-left cursor-pointer border-border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
    >
      <div className="font-medium text-lg mb-2">
        {order.product?.name || "Unknown Product"}
      </div>
      <div className="text-sm text-gray-600 mb-1">
        MO-{order.id?.toString().padStart(6, "0")}
      </div>
      <div className="text-sm text-gray-500 mb-2">
        Start: {formatDate(order.scheduleStartDate)}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">
          {order.quantity || 0} {order.product?.unit || "Units"}
        </span>
        <span className="text-sm text-gray-500 capitalize">
          {order.status?.replace("_", " ")}
        </span>
      </div>
      {order.assignedTo && (
        <div className="text-xs text-gray-400 mt-1">
          Assigned: {order.assignedTo.fullName}
        </div>
      )}
    </button>
  );
};

// Stock Levels Chart Component
const StockLevelsChart = () => {
  const { products } = useProductStore();

  // Prepare chart data from products with stock information
  const chartData = products
    .filter((product) => product.stock && product.stock.quantity > 0)
    .map((product) => ({
      name:
        product.name.length > 15
          ? product.name.substring(0, 15) + "..."
          : product.name,
      fullName: product.name,
      stock: product.stock?.quantity || 0,
      unit: product.unit,
    }))
    .sort((a, b) => a.stock - b.stock) // Sort by stock level (lowest first)
    .slice(0, 8); // Show top 8 products

  const chartConfig = {
    stock: {
      label: "Stock Quantity",
      color: "hsl(var(--color--accent))",
    },
  } satisfies ChartConfig;

  // Determine if stock is low (less than 50 units)
  const lowStockCount = chartData.filter((item) => item.stock < 50).length;

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Stock Levels by Product
          {lowStockCount > 0 && (
            <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {lowStockCount} Low Stock
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Current inventory levels - Products with low stock appear first
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
              width={500}
              height={300}
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{data.fullName}</p>
                        <p className="text-sm text-gray-600">
                          Stock: {data.stock} {data.unit}
                        </p>
                        {data.stock < 50 && (
                          <p className="text-sm text-red-600 font-medium">
                            ⚠️ Low Stock
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="stock" fill="hsl(var(--accent))" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No stock data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// MO Status Distribution Pie Chart Component
const MOStatusChart = () => {
  const { manufacturingOrders } = useMoStore();

  // Calculate status distribution
  const statusCounts = manufacturingOrders.reduce((acc, order) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare pie chart data
  const chartData = Object.entries(statusCounts).map(
    ([status, count], index) => ({
      status:
        status.replace("_", " ").charAt(0).toUpperCase() +
        status.replace("_", " ").slice(1),
      count,
      percentage: ((count / manufacturingOrders.length) * 100).toFixed(1),
      fill: `var(--chart-${index + 1})`,
    })
  );

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.status.toLowerCase().replace(" ", "_")] = {
      label: item.status,
      color: `var(--chart-${index + 1})`,
    };
    return config;
  }, {} as any) satisfies ChartConfig;

  const totalOrders = manufacturingOrders.length;

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>MO Status Distribution</CardTitle>
        <CardDescription>
          {totalOrders} total manufacturing orders
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-center">
        {totalOrders > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="h-[300px] w-full flex items-center justify-center"
          >
            <PieChart width={350} height={300}>
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{data.status}</p>
                        <p className="text-sm text-gray-600">
                          {data.count} orders ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                dataKey="count"
                nameKey="status"
                innerRadius={40}
                outerRadius={100}
                strokeWidth={2}
                paddingAngle={2}
              >
                <LabelList
                  dataKey="percentage"
                  className="fill-white font-medium"
                  stroke="none"
                  fontSize={12}
                  formatter={(value: any) => `${value}%`}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No manufacturing orders data
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const KanbanColumn = ({
  title,
  orders,
  color,
}: {
  title: string;
  orders: ManufacturingOrder[];
  color: string;
}) => {
  return (
    <div className="flex-1 h-fit min-w-0">
      <div className={`rounded-lg sticky top-0 p-4 mb-4 ${color}`}>
        <h3 className="font-medium text-lg text-white">{title}</h3>
        <span className="text-white/80 text-sm">({orders.length})</span>
      </div>
      <div className="space-y-2">
        {orders.map((order) => (
          <KanbanCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

const KanbanView = ({ data }: { data: ManufacturingOrder[] }) => {
  const columns = [
    { title: "Draft", status: "draft" as const, color: "bg-gray-500" },
    { title: "Confirmed", status: "confirmed" as const, color: "bg-[#33A7FF]" },
    {
      title: "In progress",
      status: "in_progress" as const,
      color: "bg-yellow-400",
    },
    { title: "To close", status: "to_close" as const, color: "bg-accent-red" },
    { title: "Done", status: "done" as const, color: "bg-[#99C24D]" },
  ];

  // Filter out columns that have no items
  const visibleColumns = columns.filter((column) =>
    data.some((order) => order.status === column.status)
  );

  return (
    <div className="w-full flex  overflow-auto">
      <div className="flex w-full gap-4  h-fit p-4">
        {visibleColumns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            orders={data.filter((item) => item.status === column.status)}
            color={column.color}
          />
        ))}
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const { isLoggedIn } = useUserStore();
  const { manufacturingOrders, fetchManufacturingOrders, loading, error } =
    useMoStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      fetchManufacturingOrders();
      fetchProducts(); // Fetch products for stock chart
    }
    console.log(manufacturingOrders);
  }, [isLoggedIn, router, fetchManufacturingOrders, fetchProducts]);

  const [ordersHidden, setOrdersHidden] = useState(false);

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: [
      { name: "id", weight: 0.3 },
      { name: "productId", weight: 0.2 },
      { name: "product.name", weight: 0.4 },
      { name: "status", weight: 0.3 },
      { name: "assignedTo.fullName", weight: 0.3 },
      { name: "createdBy.fullName", weight: 0.2 },
    ],
    threshold: 0.4, // Lower = more strict, Higher = more fuzzy
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true,
    minMatchCharLength: 2,
    shouldSort: true,
  };

  const fuse = useMemo(
    () => new Fuse(manufacturingOrders, fuseOptions),
    [manufacturingOrders]
  );

  // Calculate counts for each filter dynamically
  const getFilterCounts = () => {
    const counts = {
      draft: manufacturingOrders.filter((order) => order.status === "draft")
        .length,
      confirmed: manufacturingOrders.filter(
        (order) => order.status === "confirmed"
      ).length,
      in_progress: manufacturingOrders.filter(
        (order) => order.status === "in_progress"
      ).length,
      to_close: manufacturingOrders.filter(
        (order) => order.status === "to_close"
      ).length,
      not_assigned: manufacturingOrders.filter((order) => !order.assignedToId)
        .length, // Orders without assignee
      late: manufacturingOrders.filter(
        (order) =>
          order.deadline &&
          new Date(order.deadline) < new Date() &&
          order.status !== "done" &&
          order.status !== "cancelled"
      ).length, // Orders past deadline and not completed
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  const filters = [
    { number: filterCounts.draft, title: "Draft" },
    { number: filterCounts.confirmed, title: "Confirmed" },
    { number: filterCounts.in_progress, title: "In progress" },
    { number: filterCounts.to_close, title: "To close" },
    { number: filterCounts.not_assigned, title: "Not assigned" },
    { number: filterCounts.late, title: "Late" },
  ];
  const [mode, setMode] = useState("All");

  // Prepare columns for the table
  const columns: Column[] = [
    { key: "id", label: "Order ID" },
    { key: "productName", label: "Product" },
    { key: "quantity", label: "Quantity" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
  ];

  // First apply status filters
  const statusFilteredData = manufacturingOrders.filter((order) => {
    if (selectedFilter === null) return true;
    const filterTitle = filters[selectedFilter].title;

    // Handle special filter cases
    if (filterTitle === "Not assigned") {
      return !order.assignedToId;
    }
    if (filterTitle === "Late") {
      return (
        order.deadline &&
        new Date(order.deadline) < new Date() &&
        order.status !== "done" &&
        order.status !== "cancelled"
      );
    }

    // Handle regular status filters - map display titles to actual status values
    const statusMap: { [key: string]: string } = {
      Draft: "draft",
      Confirmed: "confirmed",
      "In progress": "in_progress",
      "To close": "to_close",
    };

    const actualStatus = statusMap[filterTitle];
    return actualStatus ? order.status === actualStatus : false;
  });

  // Then apply fuzzy search using Fuse.js
  const baseFilteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return statusFilteredData;
    }

    const searchFuse = new Fuse(statusFilteredData, fuseOptions);
    const results = searchFuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [statusFilteredData, searchQuery, fuseOptions]);

  // Prepare data for the table with formatted dates
  const tableData = baseFilteredData.map((order) => ({
    ...order,
    productName: order.product?.name || "Unknown Product",
    status:
      order.status.replace("_", " ").charAt(0).toUpperCase() +
      order.status.replace("_", " ").slice(1),
    createdAt: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not set",
  }));

  return (
    <div className="h-fit w-full p-2 flex flex-col">
      {/* Search & Buttons */}
      <div className="w-full flex h-[66px] gap-2 items-center">
        <Button
          onClick={() => router.push("/create-order")}
          className="px-6 shrink-0 h-[calc(100%-4px)]"
        >
          <Plus size={20} weight="regular" /> Create Order
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
            placeholder="Search orders, products, assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          className="px-6 h-full shrink-0"
          onClick={() => {
            setSelectedFilter(null);
            setSearchQuery("");
          }}
        >
          <ArrowClockwise size={20} weight="regular" /> Reset
        </Button>
        <Button
          variant="secondary"
          className="px-4 h-full shrink-0 aspect-square flex items-center justify-center"
          onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
        >
          {viewMode === "list" ? (
            <>
              <Kanban size={20} weight="regular" />
            </>
          ) : (
            <>
              <List size={20} weight="regular" />
            </>
          )}
        </Button>
      </div>

      {/* Filter Cards */}
      <div className="h-[66px] mt-2 w-full flex gap-2">
        <Dropdown
          currentValue={mode}
          setValue={setMode}
          values={["All", "My"]}
        />
        {viewMode === "list" && (
          <>
            <div className="flex gap-2">
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
          </>
        )}
      </div>
      <motion.div
        initial={{ height: "auto" }}
        animate={{ height: ordersHidden ? "72px" : "auto" }}
        className="w-full max-h-[50vh] border-2 border-border mt-2 bg-white flex flex-col rounded-xl overflow-hidden"
      >
        <div className="text-2xl p-4 px-6 flex w-full justify-between h-[70px] items-center relative">
          <div className="font-medium flex items-center gap-3">
            Manufacturing Orders
            {searchQuery && (
              <span className="text-sm font-normal bg-accent/10 text-accent px-2 py-1 rounded-md">
                {baseFilteredData.length} result
                {baseFilteredData.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>{" "}
          <div className="flex h-[70px] w-fit absolute right-0 p-2 gap-2">
            <div className="right-0 top-0 h-full aspect-square shrink-0">
              <button
                onClick={() => router.push("/manufacturing-orders")}
                className="size-full cursor-pointer  rounded-lg border-2 border-border/50  hover:bg-zinc-200 flex items-center justify-center transition-colors duration-100"
              >
                <ArrowUpRight size={24} />
              </button>
            </div>
            <div className="right-0 top-0 h-full aspect-square shrink-0">
              <button
                onClick={() => setOrdersHidden((v) => !v)}
                className="size-full cursor-pointer  rounded-lg border-2 border-border/50  hover:bg-zinc-200 flex items-center justify-center transition-colors duration-100"
              >
                <motion.div
                  animate={{ rotateZ: ordersHidden ? "180deg" : "0deg" }}
                  transition={{ duration: 0.2, ease: "circInOut" }}
                >
                  <CaretDoubleUp size={24} />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
        {loading && <div className="text-center text-lg">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && baseFilteredData.length === 0 && (
          <div className="text-center py-8">No Orders Yet</div>
        )}
        {!loading && !error && baseFilteredData.length > 0 ? (
          viewMode === "list" ? (
            <ProductionTable columns={columns} data={tableData} />
          ) : (
            <KanbanView data={baseFilteredData} />
          )
        ) : (
          !loading &&
          !error && <div className="text-center py-8">No Orders Yet</div>
        )}
      </motion.div>

      {/* Charts Section - Side by side */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        <div className="w-full lg:w-2/3">
          <StockLevelsChart />
        </div>
        <div className="w-full lg:w-1/3">
          <MOStatusChart />
        </div>
      </div>

      <div className="h-[100dvh]"></div>
    </div>
  );
};

export default Page;
