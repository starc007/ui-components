"use client";

import { BorderBeam } from "border-beam";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SponsorPlanBeam({
  enabled,
  children,
  className,
}: {
  enabled: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <BorderBeam
      size="md"
      colorVariant="colorful"
      strength={0.78}
      borderRadius={16}
      className={cn("h-full", className)}
    >
      {children}
    </BorderBeam>
  );
}
