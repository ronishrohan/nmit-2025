"use client";
import React, { useState } from "react";
import Button from "./ui/button/Button";
import Input from "./ui/input/Input";
import { workCenterApi } from "@/app/api/workCenterApi";

interface WorkCenterFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const WorkCenterForm: React.FC<WorkCenterFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacityPerHour: "",
    costPerHour: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!formData.name.trim()) {
        throw new Error("Work Center name is required");
      }

      // Validate numeric fields if provided
      if (
        formData.capacityPerHour &&
        (isNaN(Number(formData.capacityPerHour)) ||
          Number(formData.capacityPerHour) < 0)
      ) {
        throw new Error("Capacity per hour must be a valid number");
      }
      if (
        formData.costPerHour &&
        (isNaN(Number(formData.costPerHour)) ||
          Number(formData.costPerHour) < 0)
      ) {
        throw new Error("Cost per hour must be a valid number");
      }

      // Prepare payload
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim() || undefined,
        capacityPerHour: formData.capacityPerHour
          ? parseFloat(formData.capacityPerHour)
          : undefined,
        costPerHour: formData.costPerHour
          ? parseFloat(formData.costPerHour)
          : undefined,
        downtimeMins: 0, // Default to 0 for new work centers
      };

      // Call API
      const response = await workCenterApi.create(payload);

      if (response.success) {
        onSuccess();
      } else {
        throw new Error(response.message || "Failed to create work center");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Work Center Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter work center name"
            className="h-[60px]"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">Location</label>
          <Input
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="Enter location (optional)"
            className="h-[60px]"
          />
        </div>

        {/* Capacity Per Hour */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Capacity (units/hour)
          </label>
          <Input
            type="number"
            value={formData.capacityPerHour}
            onChange={(e) =>
              handleInputChange("capacityPerHour", e.target.value)
            }
            placeholder="Enter capacity per hour"
            className="h-[60px]"
          />
        </div>

        {/* Cost Per Hour */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Cost ($/hour)
          </label>
          <Input
            type="number"
            value={formData.costPerHour}
            onChange={(e) => handleInputChange("costPerHour", e.target.value)}
            placeholder="Enter cost per hour"
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
          {isSubmitting ? "Creating..." : "Create Work Center"}
        </Button>
      </div>
    </form>
  );
};

export default WorkCenterForm;
