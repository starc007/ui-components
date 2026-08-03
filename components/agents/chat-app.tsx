"use client";

import type { ComponentProps } from "react";
import { AnimatedSidebarProvider } from "@/components/motion/animated-sidebar";
import { cn } from "@/lib/utils";

export type ChatAppProps = ComponentProps<typeof AnimatedSidebarProvider> & {
  sidebarWidth?: string;
};

export function ChatApp({
  children,
  className,
  sidebarWidth = "17rem",
  style,
  ...props
}: ChatAppProps) {
  return (
    <AnimatedSidebarProvider
      {...props}
      style={{ ...style, "--sidebar-width": sidebarWidth }}
      className={cn(
        "min-h-0 w-full overflow-hidden rounded-2xl border border-border bg-background",
        className,
      )}
    >
      {children}
    </AnimatedSidebarProvider>
  );
}
