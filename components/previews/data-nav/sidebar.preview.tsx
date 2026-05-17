"use client";

import { Home, Inbox, Settings, Users, BarChart3, FolderKanban } from "lucide-react";
import { Sidebar } from "@/components/data-nav/sidebar";

export function SidebarPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--color-border)">
      <div className="flex h-[480px]">
        <Sidebar
          brand="Acme"
          groups={[
            {
              title: "Main",
              items: [
                { label: "Dashboard", href: "#", icon: Home, active: true },
                { label: "Inbox", href: "#", icon: Inbox },
                { label: "Analytics", href: "#", icon: BarChart3 },
              ],
            },
            {
              title: "Workspace",
              items: [
                { label: "Projects", href: "#", icon: FolderKanban },
                { label: "Team", href: "#", icon: Users },
                { label: "Settings", href: "#", icon: Settings },
              ],
            },
          ]}
        />
        <div className="flex-1 p-8 text-sm text-(--color-fg-muted)">Main content…</div>
      </div>
    </div>
  );
}
