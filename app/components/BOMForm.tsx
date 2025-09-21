"use client";
import React, { useState, useEffect } from "react";
import Button from "./ui/button/Button";
import Input from "./ui/input/Input";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { useProductStore } from "@/app/store/productStore";
import { bomApi } from "@/app/api/bomApi";

interface BOMFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BOMForm: React.FC<BOMFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    productId: "",
    componentId: "",
    quantity: "",
    operation: "",
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
        throw new Error("Main Product is required");
      }
      if (!formData.componentId) {
        throw new Error("Component Product is required");
      }
      if (
        !formData.quantity ||
        isNaN(Number(formData.quantity)) ||
        Number(formData.quantity) <= 0
      ) {
        throw new Error("Valid quantity is required");
      }
      if (formData.productId === formData.componentId) {
        throw new Error("Main product and component cannot be the same");
      }

      // Prepare payload
      const payload = {
        productId: parseInt(formData.productId),
        componentId: parseInt(formData.componentId),
        quantity: parseFloat(formData.quantity),
        operation: formData.operation.trim() || undefined,
      };

      // Call API
      const response = await bomApi.create(payload);

      if (response.success) {
        onSuccess();
      } else {
        throw new Error(
          response.message || "Failed to create bill of material"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare dropdown options
  const productOptions = products.map(
    (product) => `${product.id} - ${product.name}`
  );
  const selectedProductOption = formData.productId
    ? productOptions.find((option) =>
        option.startsWith(formData.productId + " -")
      ) || "Select Main Product"
    : "Select Main Product";

  const selectedComponentOption = formData.componentId
    ? productOptions.find((option) =>
        option.startsWith(formData.componentId + " -")
      ) || "Select Component Product"
    : "Select Component Product";

  // Filter out selected product from component options to prevent self-reference
  const componentOptions = productOptions.filter(
    (option) =>
      !formData.productId || !option.startsWith(formData.productId + " -")
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Product */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Main Product *
          </label>
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

        {/* Component Product */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Component Product *
          </label>
          <div className="h-[60px]">
            <Dropdown
              currentValue={selectedComponentOption}
              setValue={(value) => {
                const componentId = value.split(" -")[0];
                handleInputChange("componentId", componentId);
              }}
              values={componentOptions}
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
            placeholder="Enter quantity required"
            className="h-[60px]"
          />
        </div>

        {/* Operation */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">Operation</label>
          <Input
            value={formData.operation}
            onChange={(e) => handleInputChange("operation", e.target.value)}
            placeholder="Enter operation (optional)"
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
          {isSubmitting ? "Creating..." : "Create BOM Entry"}
        </Button>
      </div>
    </form>
  );
};

export default BOMForm;
