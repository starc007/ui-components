import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ThreeColumnLayout({
  leftSidebar,
  children,
  rightSidebar,
  className,
}: {
  leftSidebar: ReactNode;
  children: ReactNode;
  rightSidebar: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-[minmax(0,1fr)] px-4 [--left-sidebar-width:15rem] [--right-sidebar-width:20rem] md:grid-cols-[var(--left-sidebar-width)_minmax(0,1fr)] md:gap-4 md:px-6 xl:grid-cols-[var(--left-sidebar-width)_minmax(0,1fr)_var(--right-sidebar-width)] xl:gap-8 xl:px-8",
        className,
      )}
    >
      <div className="hidden min-w-0 md:block">
        <div className="fixed top-14 bottom-0 w-(--left-sidebar-width) overflow-y-auto py-6 pr-4 scrollbar-hide">
          {leftSidebar}
        </div>
      </div>
      <div className="min-w-0 py-8">{children}</div>
      <aside aria-label="Sponsors and resources" className="hidden min-w-0 xl:block">
        <div className="fixed top-24 right-8 z-10 max-h-[calc(100dvh-8rem)] w-(--right-sidebar-width) overflow-y-auto pb-1 scrollbar-hide">
          {rightSidebar}
        </div>
      </aside>
    </div>
  );
}
