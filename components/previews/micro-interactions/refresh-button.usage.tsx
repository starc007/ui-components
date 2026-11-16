"use client";

import { RefreshButton } from "@/components/motion/refresh-button";

export function RefreshButtonUsage() {
  return (
    <RefreshButton
      onRefresh={async () => {
        // Replace with your refetch; the arrows spin until it settles.
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }}
    />
  );
}
