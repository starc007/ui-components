"use client";

import {
  ArrowUpCircle,
  Bell,
  BookOpen,
  ChevronRight,
  FolderKanban,
  Home,
  LogOut,
  Settings2,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import { ExpandableTabs } from "@/components/motion/expandable-tabs";

function Row({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function Menu({ rows }: { rows: { icon: LucideIcon; label: string }[] }) {
  return (
    <div className="flex w-[17.125rem] flex-col gap-0.5">
      {rows.map((r) => (
        <Row key={r.label} icon={r.icon} label={r.label} />
      ))}
    </div>
  );
}

export function ExpandableTabsPreview() {
  return (
    <div className="flex min-h-88 w-full items-end justify-center">
      <ExpandableTabs
        items={[
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <Home className="h-4 w-4" />,
          content: (
            <Menu
              rows={[
                { icon: User, label: "profile" },
                { icon: ArrowUpCircle, label: "upgrade" },
                { icon: FolderKanban, label: "projects" },
                { icon: BookOpen, label: "documentation" },
                { icon: LogOut, label: "logout" },
              ]}
            />
          ),
        },
        {
          id: "alerts",
          label: "Alerts",
          icon: <Bell className="h-4 w-4" />,
          content: (
            <Menu
              rows={[
                { icon: Bell, label: "mentions" },
                { icon: Bell, label: "comments" },
              ]}
            />
          ),
        },
        {
          id: "settings",
          label: "Settings",
          icon: <Settings2 className="h-4 w-4" />,
          content: (
            <Menu
              rows={[
                { icon: Settings2, label: "general" },
                { icon: User, label: "account" },
                { icon: Shield, label: "privacy" },
              ]}
            />
          ),
        },
        {
          id: "docs",
          label: "Docs",
          icon: <BookOpen className="h-4 w-4" />,
          content: (
            <Menu
              rows={[
                { icon: BookOpen, label: "getting started" },
                { icon: BookOpen, label: "api reference" },
                { icon: FolderKanban, label: "examples" },
                { icon: ArrowUpCircle, label: "changelog" },
              ]}
            />
          ),
        },
        {
          id: "security",
          label: "Security",
          icon: <Shield className="h-4 w-4" />,
          content: (
            <Menu
              rows={[
                { icon: Shield, label: "two-factor auth" },
                { icon: User, label: "sessions" },
              ]}
            />
          ),
        },
        ]}
      />
    </div>
  );
}
