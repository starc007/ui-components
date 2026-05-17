"use client";

import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
};

export type SidebarGroup = {
  title?: string;
  items: SidebarItem[];
};

export interface SidebarProps {
  brand?: string;
  groups: SidebarGroup[];
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({ brand = "Workspace", groups, footer, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? 64 : 240;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "flex h-screen flex-col border-r border-(--color-border) bg-(--color-bg-elev)",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-(--color-border) px-3">
        {!collapsed ? (
          <span className="truncate text-sm font-semibold text-(--color-fg)">{brand}</span>
        ) : (
          <span className="mx-auto inline-block h-6 w-6 rounded-md bg-gradient-to-br from-(--color-accent) to-(--color-violet)" />
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label="Collapse sidebar"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-(--color-fg-muted) hover:text-(--color-fg) hover:bg-(--color-bg)"
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.title && !collapsed ? (
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-(--color-fg-muted)">
                {group.title}
              </div>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex h-9 items-center gap-3 rounded-md px-2 text-sm transition-colors",
                        item.active
                          ? "bg-(--color-bg) text-(--color-fg) font-medium"
                          : "text-(--color-fg-muted) hover:bg-(--color-bg) hover:text-(--color-fg)",
                        collapsed && "justify-center px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {footer ? <div className="border-t border-(--color-border) p-3">{footer}</div> : null}
    </motion.aside>
  );
}
