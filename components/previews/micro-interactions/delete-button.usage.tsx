"use client";

import { DeleteButton } from "@/components/motion/delete-button";

export function DeleteButtonUsage() {
  return (
    <DeleteButton
      onDelete={async () => {
        // Replace with your own request; Deleting shows until it settles.
        await new Promise((resolve) => setTimeout(resolve, 800));
      }}
    />
  );
}
