"use client";
import React, { useState, useEffect } from "react";
import Button from "./ui/button/Button";
import Input from "./ui/input/Input";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { useProductStore } from "@/app/store/productStore";
import { stockApi } from "@/app/api/stockApi";
import { MovementType } from "@/app/types";

interface StockLedgerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const StockLedgerForm: React.FC<StockLedgerFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    productId: "",
    movementType: "",
    quantity: "",
    referenceType: "",
    referenceId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { products, fetchProducts } = useProductStore();

  // Fetch required data on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.productId) {
        throw new Error("Product is required");
      }
      if (!formData.movementType) {
        throw new Error("Movement type is required");
      }
      if (
        !formData.quantity ||
        isNaN(Number(formData.quantity)) ||
        Number(formData.quantity) <= 0
      ) {
        throw new Error("Valid quantity is required");
      }

      // Validate reference ID if reference type is provided
      if (
        formData.referenceType &&
        formData.referenceId &&
        isNaN(Number(formData.referenceId))
      ) {
        throw new Error("Reference ID must be a valid number");
      }

      // Prepare payload
      const payload = {
        productId: parseInt(formData.productId),
        movementType: formData.movementType as MovementType,
        quantity: parseFloat(formData.quantity),
        referenceType: formData.referenceType.trim() || undefined,
        referenceId: formData.referenceId
          ? parseInt(formData.referenceId)
          : undefined,
      };

      // Call API
      const response = await stockApi.recordMovement(payload);

      if (response.success) {
        onSuccess();
      } else {
        throw new Error(response.message || "Failed to record stock movement");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare dropdown options
  const productOptions = products.map(
    (product) => `${product.id} - ${product.name} (${product.unit})`
  );
  const selectedProductOption = formData.productId
    ? productOptions.find((option) =>
        option.startsWith(formData.productId + " -")
      ) || "Select Product"
    : "Select Product";

  const movementTypeOptions = ["in - Stock In", "out - Stock Out"];
  const selectedMovementTypeOption = formData.movementType
    ? movementTypeOptions.find((option) =>
        option.startsWith(formData.movementType + " -")
      ) || "Select Movement Type"
    : "Select Movement Type";

  const referenceTypeOptions = [
    "Manufacturing Order",
    "Work Order",
    "Purchase Order",
    "Sales Order",
    "Adjustment",
    "Return",
    "Transfer",
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">Product *</label>
          <div className="h-[60px]">
            <Dropdown
              currentValue={selectedProductOption}
              setValue={(value) => {
                const productId = value.split(" -")[0];
                handleInputChange("productId", productId);
              }}
              values={productOptions}
              width="100%"
            />
          </div>
        </div>

        {/* Movement Type */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Movement Type *
          </label>
          <div className="h-[60px]">
            <Dropdown
              currentValue={selectedMovementTypeOption}
              setValue={(value) => {
                const movementType = value.split(" -")[0];
                handleInputChange("movementType", movementType);
              }}
              values={movementTypeOptions}
              width="100%"
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Quantity *
          </label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange("quantity", e.target.value)}
            placeholder="Enter quantity"
            className="h-[60px]"
          />
        </div>

        {/* Reference Type */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Reference Type
          </label>
          <div className="h-[60px]">
            <Dropdown
              currentValue={
                formData.referenceType || "Select Reference Type (Optional)"
              }
              setValue={(value) => {
                if (value === "Select Reference Type (Optional)") {
                  handleInputChange("referenceType", "");
                } else {
                  handleInputChange("referenceType", value);
                }
              }}
              values={[
                "Select Reference Type (Optional)",
                ...referenceTypeOptions,
              ]}
              width="100%"
            />
          </div>
        </div>

        {/* Reference ID */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Reference ID
          </label>
          <Input
            type="number"
            value={formData.referenceId}
            onChange={(e) => handleInputChange("referenceId", e.target.value)}
            placeholder="Enter reference ID (optional)"
            className="h-[60px]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
        >
          {isSubmitting ? "Recording..." : "Record Movement"}
        </Button>
      </div>
    </form>
  );
};

export default StockLedgerForm;
