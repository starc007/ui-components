import type { ReactNode } from "react";
import { PageNav, type PageNavItem } from "@/components/app/docs/page-nav";

export function GuideShell({
  children,
  navItems,
}: {
  children: ReactNode;
  navItems: PageNavItem[];
}) {
  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-10 2xl:gap-14">
      <article className="min-w-0">{children}</article>
      <PageNav items={navItems} />
    </div>
  );
}
