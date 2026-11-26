"use client";

import { useTranslations } from "use-intl";
import { SidebarNav } from "./site-sidebar/sidebar-nav";

export { SidebarCategoryTabs } from "./site-sidebar/category-tabs";
export { SidebarNav };

export function SiteSidebar() {
  const t = useTranslations("Chrome.sidebar");
  return (
    <aside aria-label={t("siteNavigation")}>
      <SidebarNav />
    </aside>
  );
}
