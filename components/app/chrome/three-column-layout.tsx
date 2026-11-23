import { useTranslations } from "use-intl";
import type { ReactNode } from "react";
import { DocsFooter } from "@/components/app/chrome/docs-footer";
import { cn } from "@/lib/utils";

/**
 * The docs grid: left navigation, content, right resources. Leave out a
 * sidebar for a page whose content should take its room; with neither, the
 * content runs the full width.
 */
export function ThreeColumnLayout({
  leftSidebar,
  children,
  rightSidebar,
  className,
}: {
  leftSidebar?: ReactNode;
  children: ReactNode;
  rightSidebar?: ReactNode;
  className?: string;
}) {
  const t = useTranslations("Chrome.sidebar");
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-[minmax(0,1fr)] px-4 [--left-sidebar-width:15rem] [--right-sidebar-width:16rem] md:gap-4 md:px-6 xl:gap-8 xl:px-8",
        leftSidebar && "md:grid-cols-[var(--left-sidebar-width)_minmax(0,1fr)]",
        leftSidebar && rightSidebar && "xl:grid-cols-[var(--left-sidebar-width)_minmax(0,1fr)_var(--right-sidebar-width)]",
        !leftSidebar && rightSidebar && "xl:grid-cols-[minmax(0,1fr)_var(--right-sidebar-width)]",
        className,
      )}
    >
      {leftSidebar ? (
        <div className="hidden min-w-0 md:block">
          <div className="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto pt-4 pb-6 pr-4 scrollbar-hide">
            {leftSidebar}
          </div>
        </div>
      ) : null}
      <div className="min-w-0 pt-8 pb-8 md:pt-12">
        {children}
        <DocsFooter />
      </div>
      {rightSidebar ? (
        <aside aria-label={t("resources")} className="hidden min-w-0 pt-4 xl:block">
          {/* 16px under the 56px header, matching the other two columns. */}
          <div className="sticky top-[4.5rem] z-10 max-h-[calc(100dvh-5.5rem)] overflow-y-auto pb-1 scrollbar-hide">
            {rightSidebar}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
