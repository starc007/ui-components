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
    <>
      <style>
        {`@keyframes beui-text-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}`}
      </style>
      <Comp
        style={{ animation: `beui-text-shimmer ${duration}s linear infinite` }}
        className={cn(
          "inline-block bg-[length:200%_100%] bg-clip-text text-transparent",
          "bg-[linear-gradient(110deg,var(--muted-foreground)_30%,var(--foreground)_50%,var(--muted-foreground)_70%)]",
          className,
        )}
      >
        {children}
      </Comp>
    </>
  );
}
