"use client";

import type { ComponentProps, ReactNode } from "react";
import { PressLink } from "@/components/app/press-link";
import { cn } from "@/lib/utils";

export interface RainbowCtaProps
  extends Omit<ComponentProps<typeof PressLink>, "children"> {
  children: ReactNode;
  innerClassName?: string;
  shape?: "rounded" | "pill";
}

export function RainbowCta({
  children,
  className,
  innerClassName,
  shape = "rounded",
  ...props
}: RainbowCtaProps) {
  const pill = shape === "pill";

  return (
    <PressLink
      className={cn(
        "group inline-flex min-h-10 animate-rainbow-border items-stretch overflow-hidden bg-primary bg-[linear-gradient(90deg,var(--success),var(--warning),var(--accent),var(--violet),var(--success),var(--warning),var(--accent),var(--violet),var(--success))] bg-[length:200%_100%] p-0.5 text-sm font-medium text-primary-foreground motion-reduce:animate-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        pill ? "rounded-full" : "rounded-lg",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-2 bg-primary px-3.5 transition-colors group-hover:bg-primary/90",
          pill ? "rounded-full" : "rounded-md",
          innerClassName,
        )}
      >
        {children}
      </span>
    </PressLink>
  );
}
