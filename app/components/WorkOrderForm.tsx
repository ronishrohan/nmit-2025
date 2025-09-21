"use client";
import React, { useState, useEffect } from "react";
import Button from "./ui/button/Button";
import Input from "./ui/input/Input";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { useMoStore } from "@/app/store/moStore";
import { useWorkCenterStore } from "@/app/store/workCenterStore";
import { useUserStore } from "@/app/store/userStore";
import { useWorkOrderStore } from "@/app/store/workOrderStore";
import { woApi } from "@/app/api/woApi";

interface WorkOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    operation: "",
    moId: "",
    workCenterId: "",
    assignedToId: "",
    durationMins: "",
    comments: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { manufacturingOrders, fetchManufacturingOrders } = useMoStore();
  const { workCenters, fetchWorkCenters } = useWorkCenterStore();
  const { user } = useUserStore();
  const { fetchWorkOrders } = useWorkOrderStore();

  // Fetch required data on component mount
  useEffect(() => {
    fetchManufacturingOrders();
    fetchWorkCenters();
  }, [fetchManufacturingOrders, fetchWorkCenters]);

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
      if (!formData.operation.trim()) {
        throw new Error("Operation is required");
      }
      if (!formData.moId) {
        throw new Error("Manufacturing Order is required");
      }
      if (!formData.durationMins || isNaN(Number(formData.durationMins))) {
        throw new Error("Valid duration is required");
      }

      // Prepare payload
      const payload = {
        operation: formData.operation.trim(),
        moId: parseInt(formData.moId),
        workCenterId: formData.workCenterId
          ? parseInt(formData.workCenterId)
          : undefined,
        assignedToId: formData.assignedToId
          ? parseInt(formData.assignedToId)
          : undefined,
        durationMins: parseInt(formData.durationMins),
        comments: formData.comments.trim() || undefined,
        status: "to_do",
        durationDoneMins: 0,
      };

      // Call API
      const response = await woApi.create(payload);

      if (response.success) {
        // Refresh work orders list
        await fetchWorkOrders();
        onSuccess();
      } else {
        throw new Error(response.message || "Failed to create work order");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare dropdown options
  const moOptions = manufacturingOrders.map(
    (mo) =>
      `${mo.id} - ${mo.product?.name || "Unknown Product"} (${
        mo.quantity || 0
      } units)`
  );
  const selectedMoOption = formData.moId
    ? moOptions.find((option) => option.startsWith(formData.moId + " -")) ||
      "Select Manufacturing Order"
    : "Select Manufacturing Order";

  const workCenterOptions = workCenters.map((wc) => `${wc.id} - ${wc.name}`);
  const selectedWorkCenterOption = formData.workCenterId
    ? workCenterOptions.find((option) =>
        option.startsWith(formData.workCenterId + " -")
      ) || "Select Work Center (Optional)"
    : "Select Work Center (Optional)";

  // For now, we'll use a simple text input for assigned user
  // In a real app, you'd want to fetch and display available users

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operation */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Operation *
          </label>
          <Input
            value={formData.operation}
            onChange={(e) => handleInputChange("operation", e.target.value)}
            placeholder="Enter operation name"
            className="h-[60px]"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Duration (minutes) *
          </label>
          <Input
            type="number"
            value={formData.durationMins}
            onChange={(e) => handleInputChange("durationMins", e.target.value)}
            placeholder="Enter duration in minutes"
            className="h-[60px]"
          />
        </div>

        {/* Manufacturing Order */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Manufacturing Order *
          </label>
          <div className="h-[60px]">
            <Dropdown
              currentValue={selectedMoOption}
              setValue={(value) => {
                const moId = value.split(" -")[0];
                handleInputChange("moId", moId);
              }}
              values={moOptions}
              width="100%"
            />
          </div>
        </div>

        {/* Work Center */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Work Center
          </label>
          <div className="h-[60px]">
            <Dropdown
              currentValue={selectedWorkCenterOption}
              setValue={(value) => {
                if (value === "Select Work Center (Optional)") {
                  handleInputChange("workCenterId", "");
                } else {
                  const workCenterId = value.split(" -")[0];
                  handleInputChange("workCenterId", workCenterId);
                }
              }}
              values={["Select Work Center (Optional)", ...workCenterOptions]}
              width="100%"
            />
          </div>
        </div>

        {/* Assigned To */}
        <div className="space-y-2">
          <label className="text-lg font-medium text-gray-700">
            Assigned To (User ID)
          </label>
          <Input
            type="number"
            value={formData.assignedToId}
            onChange={(e) => handleInputChange("assignedToId", e.target.value)}
            placeholder="Enter user ID (optional)"
            className="h-[60px]"
          />
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-2">
        <label className="text-lg font-medium text-gray-700">Comments</label>
        <Input
          value={formData.comments}
          onChange={(e) => handleInputChange("comments", e.target.value)}
          placeholder="Enter any additional comments"
          className="h-[60px]"
        />
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
          {isSubmitting ? "Creating..." : "Create Work Order"}
        </Button>
      </div>
    </form>
  );
};

export default WorkOrderForm;
