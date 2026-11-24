"use client";

import { isNativePath } from "@/lib/component-paths";
import { usePathname } from "@/lib/navigation";
import { NativeSidebarNav } from "./native-sidebar-nav";
import { WebSidebarNav } from "./web-sidebar-nav";

/** Nav list shared by the desktop sidebar and the mobile bottom sheet. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  if (isNativePath(pathname)) {
    return <NativeSidebarNav pathname={pathname} onNavigate={onNavigate} />;
  }
  return <WebSidebarNav pathname={pathname} onNavigate={onNavigate} />;
}
