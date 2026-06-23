"use client";

import { Spinner } from "@/components/motion/spinner";

export function SpinnerPreview() {
  return (
    <div className="flex flex-col items-center gap-4 text-primary">
      <Spinner size={34} />
      <div className="flex items-center gap-4 text-muted-foreground">
        <Spinner size={18} />
        <Spinner size={18} variant="dots" />
        <Spinner size={24} />
      </div>
    </div>
  );
}
