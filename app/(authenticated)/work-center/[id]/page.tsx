"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkCenterStore } from "@/app/store/workCenterStore";

const WorkCenterDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { currentWorkCenter, fetchWorkCenterById, loading, error } = useWorkCenterStore();

  useEffect(() => {
    if (id) {
      fetchWorkCenterById(Number(id));
    }
  }, [id, fetchWorkCenterById]);

  return (
    <div className="p-2 size-full">
      <div className="rounded-xl bg-white border-2 border-border h-fit p-4 flex flex-col gap-2">
        {loading && <div className="text-lg">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && !currentWorkCenter && (
          <div className="text-lg">Work center not found.</div>
        )}
        {!loading && !error && currentWorkCenter && (
          <>
            <div className="bg-background p-5 px-8 text-2xl font-mono text-inactive rounded-lg w-fit">
              Work Center - {String(currentWorkCenter.id).padStart(6, "0")}
            </div>
            <div>Name: {currentWorkCenter.name}</div>
            <div>Location: {currentWorkCenter.location ?? "N/A"}</div>
            <div>Capacity/hr: {currentWorkCenter.capacityPerHour ?? "N/A"}</div>
            <div>Cost/hr: {currentWorkCenter.costPerHour ?? "N/A"}</div>
            <div>Downtime (mins): {currentWorkCenter.downtimeMins ?? "N/A"}</div>
            <div>Created: {currentWorkCenter.createdAt ? String(currentWorkCenter.createdAt) : "N/A"}</div>
            <button className="mt-4 px-4 py-2 bg-zinc-200 rounded" onClick={() => router.back()}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkCenterDetailsPage;
