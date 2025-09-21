"use client";

import Button from "@/app/components/ui/button/Button";
import Input from "@/app/components/ui/input/Input";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { moApi } from "@/app/api/moApi";
import { productApi } from "@/app/api/productApi";

// TypeScript interfaces
interface Component {
  id: number;
  name: string;
  unit: string;
  description: string;
  price?: number;
}

interface ComponentProduct {
  id: number;
  name: string;
  description: string;
  unit: string;
  price?: number;
  cost?: number;
  createdAt: string;
}

interface BOMItem {
  id: number;
  productId: number;
  operation: string;
  opDurationMins: number;
  componentId: number;
  quantity: number;
  createdAt: string;
  component: Component;
}

interface Stock {
  id: number;
  productId: number;
  quantity: number;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  unit: string;
  createdAt: string;
  bom: BOMItem[];
  stock: Stock;
  basePrice?: number;
  laborCostPerMinute?: number;
}

interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignedToId?: number;
  scheduleStartDate?: string;
  deadline?: string;
  product?: Product;
}

type TabType = "components" | "workorders";

// Display Box Component for read-only data
const DisplayBox: React.FC<{
  label: string;
  value: string;
  className?: string;
}> = ({ label, value, className = "" }) => (
  <div
    className={`border-2 border-border rounded-lg p-3 bg-gray-50 ${className}`}
  >
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-lg font-medium">{value || "N/A"}</div>
  </div>
);

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [productData, setProductData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("components");
  const [componentPrices, setComponentPrices] = useState<
    Record<number, ComponentProduct>
  >({});
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch order data
        const orderResponse = await moApi.getById(Number(id));
        const orderData = orderResponse.data as Order;
        setOrder(orderData);

        // If order has a product, fetch product details
        if (orderData.productId) {
          try {
            const productResponse = await productApi.getById(
              orderData.productId
            );
            const product = productResponse.data as Product;
            setProductData(product);

            // Fetch component prices if BOM exists
            if (product.bom && product.bom.length > 0) {
              const componentPricesMap = await fetchComponentPrices(
                product.bom
              );
              setComponentPrices(componentPricesMap);

              // Calculate total price
              const calculatedPrice = calculateTotalPrice(
                product.bom,
                orderData.quantity || 1,
                componentPricesMap
              );
              setTotalPrice(calculatedPrice);
            }
          } catch (productError) {
            console.error("Error fetching product data:", productError);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to load order data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  const fetchComponentPrices = async (
    bom: BOMItem[]
  ): Promise<Record<number, ComponentProduct>> => {
    const componentPricesMap: Record<number, ComponentProduct> = {};

    try {
      // Fetch all component details in parallel
      const componentPromises = bom.map(async (bomItem) => {
        try {
          const response = await productApi.getById(bomItem.componentId);
          return {
            componentId: bomItem.componentId,
            data: response.data,
          };
        } catch (error) {
          console.error(
            `Error fetching component ${bomItem.componentId}:`,
            error
          );
          return {
            componentId: bomItem.componentId,
            data: null,
          };
        }
      });

      const componentResults = await Promise.all(componentPromises);

      componentResults.forEach((result) => {
        if (result.data) {
          componentPricesMap[result.componentId] =
            result.data as ComponentProduct;
        }
      });

      return componentPricesMap;
    } catch (error) {
      console.error("Error fetching component prices:", error);
      return componentPricesMap;
    }
  };

  const calculateTotalPrice = (
    bom: BOMItem[],
    quantity: number,
    componentPricesMap: Record<number, ComponentProduct>
  ): number => {
    // Calculate material costs using actual component prices
    const materialCost = bom.reduce((total: number, item: BOMItem) => {
      const componentData = componentPricesMap[item.componentId];
      const componentPrice = componentData?.price || componentData?.cost || 0;
      return total + componentPrice * item.quantity * quantity;
    }, 0);

    // Calculate labor costs (assuming $0.50 per minute)
    const totalLaborMinutes = bom.reduce((total: number, item: BOMItem) => {
      return total + item.opDurationMins * quantity;
    }, 0);
    const laborCostPerMinute = 0.5; // $0.50 per minute
    const laborCost = totalLaborMinutes * laborCostPerMinute;

    return materialCost + laborCost;
  };

  const handleTabClick = (tab: TabType): void => {
    setActiveTab(tab);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="p-2 size-full">
      <div className="flex gap-2 h-[66px] mb-2">
        <Button
          onClick={() => router.push(`/create-order?editId=${id}`)}
          className="text-xl px-6"
        >
          Edit Order
        </Button>
        <Button
          onClick={() => router.back()}
          variant="secondary"
          className="text-xl px-6"
        >
          Back
        </Button>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex items-center justify-center">
          <div className="text-lg">Loading order details...</div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex items-center justify-center">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      )}

      {!isLoading && !error && !order && (
        <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex items-center justify-center">
          <div className="text-lg">Order not found.</div>
        </div>
      )}

      {!isLoading && !error && order && (
        <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2">
          <div className="bg-background p-5 px-8 text-2xl font-mono font-medium text-inactive rounded-lg w-fit">
            MO {order.id}
          </div>

          <div className="flex gap-2 w-full">
            <DisplayBox
              label="Product"
              value={productData?.name || `Product ID: ${order.productId}`}
              className="flex-1"
            />
            <DisplayBox
              label="Quantity"
              value={order.quantity?.toString() || "0"}
              className="w-32"
            />
          </div>

          <div className="flex gap-2 w-full">
            <DisplayBox
              label="Schedule Start Date"
              value={formatDate(order.scheduleStartDate)}
              className="flex-1"
            />
            <DisplayBox
              label="Deadline"
              value={formatDate(order.deadline)}
              className="flex-1"
            />
          </div>

          <div className="flex gap-2 w-full">
            <DisplayBox
              label="Status"
              value={order.status}
              className="flex-1"
            />
            <DisplayBox
              label="Assigned To ID"
              value={order.assignedToId?.toString() || "N/A"}
              className="flex-1"
            />
          </div>

          <DisplayBox
            label="Total Price"
            value={
              totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : "Calculating..."
            }
            className="w-full"
          />

          <div className="flex gap-2 w-full">
            <DisplayBox
              label="Created At"
              value={formatDate(order.createdAt)}
              className="flex-1"
            />
            <DisplayBox
              label="Updated At"
              value={formatDate(order.updatedAt)}
              className="flex-1"
            />
          </div>

          {productData && productData.bom && productData.bom.length > 0 && (
            <div className="w-full flex flex-col rounded-xl overflow-hidden border-2 border-border mt-4">
              <div className="flex w-full h-[60px] text-xl border-b-2 border-b-border">
                <div
                  className={`w-1/2 flex items-center px-4 cursor-pointer transition-colors ${
                    activeTab === "components"
                      ? "bg-white font-semibold"
                      : "bg-zinc-200 hover:bg-zinc-100"
                  }`}
                  onClick={() => handleTabClick("components")}
                >
                  Components
                </div>
                <div
                  className={`w-1/2 flex items-center px-4 cursor-pointer transition-colors ${
                    activeTab === "workorders"
                      ? "bg-white font-semibold"
                      : "bg-zinc-200 hover:bg-zinc-100"
                  }`}
                  onClick={() => handleTabClick("workorders")}
                >
                  Work Orders
                </div>
              </div>

              <div className="flex flex-col min-h-[200px]">
                {activeTab === "components" && (
                  <div className="p-4">
                    <ul className="space-y-2">
                      {productData.bom.map((bomItem: BOMItem) => {
                        const componentData =
                          componentPrices[bomItem.componentId];
                        const componentPrice =
                          componentData?.price || componentData?.cost || 0;
                        const totalComponentCost =
                          componentPrice *
                          bomItem.quantity *
                          (order.quantity || 1);

                        return (
                          <li
                            key={bomItem.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div className="flex-1">
                              <span className="font-medium">
                                {componentData?.name ||
                                  bomItem.component?.name ||
                                  `Component ${bomItem.componentId}`}
                              </span>
                              <div className="text-sm text-gray-600">
                                {bomItem.quantity}{" "}
                                {componentData?.unit ||
                                  bomItem.component?.unit ||
                                  "units"}{" "}
                                × {order.quantity} ={" "}
                                {bomItem.quantity * (order.quantity || 1)} total
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                ${totalComponentCost.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                ${componentPrice.toFixed(2)} each
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {activeTab === "workorders" && (
                  <div className="p-4">
                    <div className="space-y-3">
                      {productData.bom
                        .sort(
                          (a: BOMItem, b: BOMItem) =>
                            a.opDurationMins - b.opDurationMins
                        )
                        .map((bomItem: BOMItem) => {
                          const totalDuration =
                            bomItem.opDurationMins * (order.quantity || 1);
                          const laborCost = totalDuration * 0.5; // $0.50 per minute

                          return (
                            <div
                              key={bomItem.id}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-lg">
                                  {bomItem.operation}
                                </h4>
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Work Center {(bomItem.id % 3) + 1}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Duration:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {totalDuration} minutes
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Labor Cost:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    ${laborCost.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Component:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {componentPrices[bomItem.componentId]
                                      ?.name ||
                                      bomItem.component?.name ||
                                      `Component ${bomItem.componentId}`}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <span className="ml-2 font-medium text-orange-600">
                                    To Do
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(!productData ||
            !productData.bom ||
            productData.bom.length === 0) && (
            <div className="w-full flex flex-col rounded-xl overflow-hidden border-2 border-border mt-4">
              <div className="flex items-center justify-center h-32 text-gray-500">
                No BOM data available for this product
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
