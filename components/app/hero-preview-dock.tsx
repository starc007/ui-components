"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Bell, Check, Command, Search, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { Switch } from "@/components/motion/switch";
import { NumberTicker } from "@/components/motion/number-ticker";
import { cn } from "@/lib/utils";

export function HeroPreviewDock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="relative"
    >

      <div className="overflow-hidden rounded-3xl glass-strong">
        <div className="flex items-center gap-2 border-b border-(--color-border) px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-(--color-border-strong)" />
            <span className="h-2.5 w-2.5 rounded-full border border-(--color-border-strong)" />
            <span className="h-2.5 w-2.5 rounded-full border border-(--color-border-strong)" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md border border-(--color-border) bg-(--color-bg)/60 px-3 py-1 text-xs text-(--color-fg-muted)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-fg)" />
            beui.xyz / dashboard
          </div>
          <div className="flex items-center gap-1 text-(--color-fg-muted)">
            <kbd className="hidden items-center gap-1 rounded border border-(--color-border) bg-(--color-bg) px-1.5 py-0.5 text-[10px] sm:inline-flex">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-(--color-border) md:grid-cols-[280px_1fr]">
          <SidePanel />
          <MainPanel />
        </div>
      </div>
    </motion.div>
  );
}

function Pill({ children, solid = false }: { children: React.ReactNode; solid?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        solid
          ? "border-(--color-fg) bg-(--color-fg) text-(--color-bg)"
          : "border-(--color-border) bg-(--color-bg-elev) text-(--color-fg-muted)",
      )}
    >
      {children}
    </span>
  );
}

function SidePanel() {
  return (
    <div className="bg-(--color-bg)/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-(--color-fg-muted)">
          Workspace
        </span>
        <Pill solid>Pro</Pill>
      </div>
      <ul className="flex flex-col gap-0.5">
        {[
          { label: "Overview", active: true, badge: null },
          { label: "Components", active: false, badge: "11" },
          { label: "Inbox", active: false, badge: "3" },
          { label: "Activity", active: false, badge: null },
          { label: "Settings", active: false, badge: null },
        ].map((item) => (
          <li key={item.label}>
            <div
              className={cn(
                "flex h-8 items-center justify-between rounded-md px-2 text-sm transition-colors",
                item.active
                  ? "bg-(--color-bg-elev) text-(--color-fg) font-medium border border-(--color-border)"
                  : "text-(--color-fg-muted)",
              )}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="rounded bg-(--color-bg-elev) px-1.5 py-0.5 text-[10px] text-(--color-fg-muted)">
                  {item.badge}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-3">
        <div className="flex items-center gap-2 text-xs text-(--color-fg)">
          <Sparkles className="h-3.5 w-3.5 text-(--color-fg)" />
          Bespoke motion components
        </div>
        <p className="mt-1 text-[11px] text-(--color-fg-muted)">
          Tabs, switches, sheets, palettes. All motion-driven.
        </p>
      </div>
    </div>
  );
}

function MainPanel() {
  const [notifs, setNotifs] = useState(true);

  return (
    <div className="bg-(--color-bg)/40 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-(--color-fg-muted)">Monthly recurring</p>
          <div className="mt-1 flex items-baseline gap-2">
            <NumberTicker
              value={129480}
              prefix="$"
              locale
              className="text-3xl font-semibold tracking-tight text-(--color-fg)"
            />
            <span className="inline-flex items-center gap-0.5 rounded-md border border-(--color-border) bg-(--color-bg-elev) px-1.5 py-0.5 text-[11px] font-medium text-(--color-fg)">
              <ArrowUpRight className="h-3 w-3" />
              12.4%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-border) bg-(--color-bg-elev) text-(--color-fg-muted) press hover:text-(--color-fg)">
            <Bell className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--color-border) bg-(--color-bg-elev) px-2.5 text-xs text-(--color-fg) press">
            <Search className="h-3.5 w-3.5 text-(--color-fg-muted)" />
            Search
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" variant="segment" className="mt-5">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Spark />
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Active" value={2841} />
            <Stat label="New" value={319} />
            <Stat label="Churn" value={1.2} suffix="%" />
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <ul className="flex flex-col gap-2">
            {[
              { who: "Ada", what: "shipped v2.0.0", when: "2m ago" },
              { who: "Linus", what: "opened PR #142", when: "14m ago" },
              { who: "Grace", what: "merged auth refactor", when: "1h ago" },
            ].map((row) => (
              <li
                key={row.who}
                className="flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-bg-elev) px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-(--color-bg) text-[10px] font-semibold text-(--color-fg)">
                    {row.who[0]}
                  </span>
                  <span className="text-(--color-fg)">
                    <span className="font-medium">{row.who}</span>{" "}
                    <span className="text-(--color-fg-muted)">{row.what}</span>
                  </span>
                </div>
                <span className="text-xs text-(--color-fg-muted)">{row.when}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="billing">
          <div className="flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-bg-elev) p-4">
            <div>
              <p className="text-sm font-medium text-(--color-fg)">Notifications</p>
              <p className="text-xs text-(--color-fg-muted)">Email me when invoices are paid.</p>
            </div>
            <Switch checked={notifs} onCheckedChange={setNotifs} />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-bg-elev) p-4">
            <div className="flex items-center gap-2 text-sm text-(--color-fg)">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-elev) text-(--color-fg)">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              Plan: Pro
            </div>
            <Pill>Active</Pill>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-bg-elev) p-3">
      <p className="text-[11px] text-(--color-fg-muted)">{label}</p>
      <NumberTicker
        value={value}
        suffix={suffix}
        locale
        className="mt-1 text-lg font-semibold text-(--color-fg)"
      />
    </div>
  );
}

function Spark() {
  const points = [4, 9, 6, 12, 8, 14, 10, 18, 13, 22, 17, 26, 21, 28];
  const max = Math.max(...points);
  const w = 100;
  const h = 36;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-elev) p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-(--color-fg-muted)">Last 14 days</p>
        <p className="text-xs font-medium text-(--color-fg)">+24%</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-16 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--fg)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--fg)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark)" />
        <path d={path} fill="none" stroke="var(--fg)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
