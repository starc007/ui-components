import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

export interface TextShimmerProps {
  children: ReactNode;
  as?: ElementType;
  duration?: number;
  className?: string;
}

export function TextShimmer({ children, as: Comp = "span", duration = 2.5, className }: TextShimmerProps) {
  return (
    <Comp
      style={{ animationDuration: `${duration}s` }}
      className={cn(
        "inline-block bg-clip-text text-transparent animate-shimmer",
        "bg-[linear-gradient(110deg,var(--color-fg-muted)_30%,var(--color-fg)_50%,var(--color-fg-muted)_70%)]",
        "bg-[length:200%_100%]",
        className,
      )}
    >
      {children}
    </Comp>
  );
}
