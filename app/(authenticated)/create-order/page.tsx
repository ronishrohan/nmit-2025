"use client";
import { moApi } from "@/app/api/moApi";
import { moPresetsApi } from "@/app/api/moPresetsApi";
import { productApi } from "@/app/api/productApi";
import Button from "@/app/components/ui/button/Button";
import { Dropdown } from "@/app/components/ui/dropdown/Dropdown";
import Input from "@/app/components/ui/input/Input";
import { useUserStore } from "@/app/store";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  basePrice?: number; // Optional base price for the product
  laborCostPerMinute?: number; // Optional labor cost per minute
}

interface CreatedBy {
  id: number;
  name: string;
  email: string;
}

interface Preset {
  id: number;
  name: string;
  description: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  productId: number;
  createdById: number;
  createdBy: CreatedBy;
  product: Product;
}

interface Order {
  id: number;
}

type TabType = "components" | "workorders";

const page: React.FC = () => {
  const searchParams = useSearchParams();
  const [presets, setPresets] = useState<Preset[] | null>(null);
  const [productData, setProductData] = useState<Product | null>(null);
  const [selectedPresetData, setSelectedPresetData] = useState<Preset | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<TabType>("components");
  const { userId } = useUserStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [quantity, setQuantity] = useState<number>(2);
  const [product, setProduct] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [componentPrices, setComponentPrices] = useState<
    Record<number, ComponentProduct>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scheduleStartDate, setScheduleStartDate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [assignedToId, setAssignedToId] = useState<number>(10);

  // Draft management state
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);
  const [showDeleteDraftPopup, setShowDeleteDraftPopup] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If editId is present, fetch the order and prefill
        const editId = searchParams.get("editId");
        if (editId) {
          // Fetch the order by ID and prefill form
          const orderRes = await moApi.getById(Number(editId));
          const orderData = orderRes.data as Order & { productId?: number; quantity?: number; scheduleStartDate?: string; deadline?: string; assignedToId?: number };
          setOrder(orderData);
          setQuantity(orderData.quantity ?? 1);
          setScheduleStartDate(orderData.scheduleStartDate || "");
          setDeadline(orderData.deadline || "");
          setAssignedToId(orderData.assignedToId || 10);
          // Fetch presets and set selected preset
          const presetsResponse = await moPresetsApi.getAll();
          const presetsData = presetsResponse.data as Preset[];
          setPresets(presetsData);
          const preset = presetsData.find((p: any) => p.productId === orderData.productId);
          setSelectedPresetData(preset || null);
          setProduct(preset?.name || null);
          // Optionally, fetch and set component prices, etc.
          // ...
          return;
        }

        console.log("user id", userId);
        const orderResponse = await moApi.create({ userId: userId });
        setOrder(orderResponse.data as Order);
        const presetsResponse = await moPresetsApi.getAll();
        setPresets(presetsResponse.data as Preset[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId, searchParams]);

  const handlePresetSelection = async (presetName: string): Promise<void> => {
    if (!presets) return;

    const selectedPreset = presets.find((p: Preset) => p.name === presetName);
    if (selectedPreset) {
      setSelectedPresetData(selectedPreset);

      // Fetch component prices
      const componentPricesMap = await fetchComponentPrices(
        selectedPreset.product.bom
      );
      setComponentPrices(componentPricesMap);

      // Calculate and set total price
      const calculatedPrice = calculateTotalPrice(
        selectedPreset.product.bom,
        quantity,
        componentPricesMap
      );
      setTotalPrice(calculatedPrice);
    }
  };

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
          componentPricesMap[result.componentId] = result.data as ComponentProduct;
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

  const calculateTotalDuration = (bom: BOMItem[]): number => {
    return bom.reduce(
      (total: number, item: BOMItem) => total + item.opDurationMins,
      0
    );
  };

  const calculateTotalComponents = (bom: BOMItem[]): number => {
    return bom.reduce(
      (total: number, item: BOMItem) => total + item.quantity * quantity,
      0
    );
  };

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(value);

    // Recalculate total price when quantity changes
    if (selectedPresetData && Object.keys(componentPrices).length > 0) {
      const calculatedPrice = calculateTotalPrice(
        selectedPresetData.product.bom,
        value,
        componentPrices
      );
      setTotalPrice(calculatedPrice);
    }
  };

  const handleTabClick = (tab: TabType): void => {
    setActiveTab(tab);
  };

  const handleSaveDraft = async (): Promise<void> => {
    if (!selectedPresetData || !order) {
      // alert('Please select a product and ensure order is created')
      return;
    }

    setIsLoading(true);

    try {
      // Group BOM items by operation to create worout orders
      const operationGroups = selectedPresetData.product.bom.reduce(
        (groups, bomItem) => {
          if (!groups[bomItem.operation]) {
            groups[bomItem.operation] = [];
          }
          groups[bomItem.operation].push(bomItem);
          return groups;
        },
        {} as Record<string, BOMItem[]>
      );

      // Create work orders from operation groups
      const workOrders = Object.entries(operationGroups).map(
        ([operation, bomItems], index) => {
          const totalDuration = bomItems.reduce(
            (total, item) => total + item.opDurationMins * quantity,
            0
          );

          return {
            operation: operation,
            status: "to_do",
            comments: `${operation} for ${selectedPresetData.product.name}`,
            durationMins: totalDuration,
            workCenterId: (index % 3) + 1, // Distribute across work centers 1, 2, 3
            assignedToId: assignedToId,
          };
        }
      );

      const draftData = {
        id: order.id,
        userId: userId,
        productId: selectedPresetData.productId,
        product: {
          name: selectedPresetData.product.name,
          description: selectedPresetData.product.description,
          unit: selectedPresetData.product.unit,
        },
        quantity: quantity,
        scheduleStartDate: scheduleStartDate
          ? new Date(scheduleStartDate).toISOString()
          : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        assignedToId: assignedToId,
        components: selectedPresetData.product.bom.map((bomItem) => ({
          componentId: bomItem.componentId,
          quantity: bomItem.quantity * quantity,
          operation: bomItem.operation,
          opDurationMins: bomItem.opDurationMins,
        })),
        workOrders: workOrders,
        status: "draft",
      };
      console.log(draftData);
      const response = await moApi.saveDraft(draftData);
      console.log("Draft saved:", response);

      // Mark draft as saved
      setIsDraftSaved(true);

      // Show success message (you can replace with a toast notification)
      // alert('Draft saved successfully!')
    } catch (error) {
      console.error("Error saving draft:", error);
      // alert('Error saving draft. Please try again.')
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = (): void => {
    if (!isDraftSaved) {
      // This will only be called if the button is somehow clicked despite being disabled
      return;
    }

    // Proceed with order confirmation logic
    console.log("Confirming order...");
    // Add your confirmation API call here
  };

  const handleConfirmAttempt = (): void => {
    if (!isDraftSaved) {
      // Show alert when trying to click disabled button
      alert("Please save as draft first before confirming the order.");
    } else {
      handleConfirmOrder();
    }
  };

  const handleBackClick = (): void => {
    if (isDraftSaved) {
      // Show popup to delete draft or go back
      setShowDeleteDraftPopup(true);
    } else {
      // Go back directly
      router.push("/dashboard");
    }
  };

  const handleDeleteDraft = (): void => {
    // Reset all form data
    setSelectedPresetData(null);
    setQuantity(2);
    setScheduleStartDate("");
    setDeadline("");
    setTotalPrice(0);
    setComponentPrices({});
    setIsDraftSaved(false);
    setShowDeleteDraftPopup(false);

    // Go back to dashboard
    router.push("/dashboard");
  };

  const handleKeepDraft = (): void => {
    setShowDeleteDraftPopup(false);
    // Stay on the page with draft intact
  };

  const router = useRouter();
  return (
    <div className="p-2 size-full">
      <div className="flex gap-2 h-[66px] mb-2">
        <Button
          onClick={handleConfirmAttempt}
          className={`text-xl px-6 ${
            !isDraftSaved ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Confirm
        </Button>
        <Button
          onClick={handleBackClick}
          variant="secondary"
          className="text-xl px-6"
        >
          Back
        </Button>
        <Button
          onClick={handleSaveDraft}
          className={`text-xl px-6 ml-auto ${
            isDraftSaved ? "bg-green-600 hover:bg-green-700" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading
            ? "Saving..."
            : isDraftSaved
            ? "Draft Saved ✓"
            : "Save Draft"}
        </Button>
      </div>

      {/* Alert message positioned below buttons */}
      {!isDraftSaved && selectedPresetData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">
            💡 <strong>Save as draft first</strong> to enable order
            confirmation.
          </p>
        </div>
      )}

      {/* Delete Draft Popup */}
      {showDeleteDraftPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Draft Saved</h3>
            <p className="text-gray-600 mb-6">
              You have a saved draft. Do you want to delete it and go back, or
              keep working on it?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={handleKeepDraft}
                variant="secondary"
                className="px-4 py-2"
              >
                Keep Draft
              </Button>
              <Button
                onClick={handleDeleteDraft}
                className="px-4 py-2 bg-red-600 hover:bg-red-700"
              >
                Delete & Go Back
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2">
        <div className="bg-background p-5 px-8 text-2xl font-mono font-medium text-inactive rounded-lg w-fit">
          MO {order?.id ?? "Loading"}
        </div>

        <div className="flex gap-2 w-full">
          {presets && (
            <Dropdown
              width={460}
              currentValue={product ?? "None"}
              setValue={(selectedProduct: string) => {
                setProduct(selectedProduct);
                handlePresetSelection(selectedProduct);
              }}
              values={presets.map((p: Preset) => p.name)}
            />
          )}
          <Input
            placeholder="Quantity"
            type="number"
            defaultValue="2"
            onChange={handleQuantityChange}
          />
        </div>

        <div className="flex gap-2 w-full">
          <Input
            placeholder="Schedule Start Date"
            type="date"
            value={scheduleStartDate}
            onChange={(e) => setScheduleStartDate(e.target.value)}
            disabled={isLoading}
          />
          <Input
            placeholder="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2 w-full">
          {/* <Input 
            placeholder='Status' 
            defaultValue='draft' 
            disabled={isLoading}
          /> */}
        </div>

        <div className="flex gap-2 w-full">
          {/* <Input 
            placeholder='Assigned To ID' 
            type='number' 
            value={assignedToId}
            onChange={(e) => setAssignedToId(parseInt(e.target.value))}
            disabled={isLoading}
          /> */}
        </div>

        <Input
          placeholder="Total Price"
          type="number"
          value={totalPrice > 0 ? totalPrice.toFixed(2) : ""}
          disabled={isLoading}
        />

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
            {!selectedPresetData ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                Select a product preset to view details
              </div>
            ) : (
              <>
                {activeTab === "components" && (
                  <div className="p-4">
                    <ul className="space-y-2">
                      {selectedPresetData.product.bom.map(
                        (bomItem: BOMItem) => {
                          const componentData =
                            componentPrices[bomItem.componentId];
                          const price =
                            componentData?.price || componentData?.cost || 0;
                          const totalComponentCost =
                            price * bomItem.quantity * quantity;

                          return (
                            <li
                              key={bomItem.id}
                              className="text-gray-700 flex justify-between"
                            >
                              <span>
                                {bomItem.component.name} (
                                {bomItem.quantity * quantity}{" "}
                                {bomItem.component.unit})
                              </span>
                              {price > 0 && (
                                <span className="text-gray-500 text-sm">
                                  ${totalComponentCost.toFixed(2)}
                                </span>
                              )}
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>
                )}

                {activeTab === "workorders" && (
                  <div className="p-4">
                    <div className="space-y-3">
                      {selectedPresetData.product.bom
                        .sort(
                          (a: BOMItem, b: BOMItem) =>
                            a.opDurationMins - b.opDurationMins
                        )
                        .map((bomItem: BOMItem) => (
                          <div
                            key={bomItem.id}
                            className="border rounded-lg p-3 bg-gray-50"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                    {bomItem.operation}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {bomItem.opDurationMins} mins
                                  </span>
                                </div>
                                <h4 className="font-medium text-gray-900">
                                  {bomItem.component.name}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {bomItem.component.description}
                                </p>
                                <div className="flex gap-4 mt-2 text-sm">
                                  <span className="text-gray-500">
                                    Components:{" "}
                                    <span className="font-medium">
                                      {bomItem.quantity * quantity}
                                    </span>
                                  </span>
                                  <span className="text-gray-500">
                                    Unit:{" "}
                                    <span className="font-medium">
                                      {bomItem.component.unit}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {bomItem.opDurationMins * quantity} mins total
                                </div>
                                <div className="text-xs text-gray-500">
                                  for {quantity} units
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
