"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Bell, Check, Command, Search, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
      <div
        aria-hidden
        className="absolute -inset-x-6 -top-6 -bottom-12 -z-10 rounded-[2rem] opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, color-mix(in oklch, var(--brand-accent) 35%, transparent), transparent 70%)",
        }}
      />

      <div className="overflow-hidden rounded-2xl glass-strong">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            beui.xyz / dashboard
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <kbd className="hidden items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] sm:inline-flex">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-[280px_1fr]">
          <SidePanel />
          <MainPanel />
        </div>
      </div>
    </motion.div>
  );
}

function SidePanel() {
  return (
    <div className="bg-background/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </span>
        <Badge variant="secondary" className="text-[10px]">Pro</Badge>
      </div>
      <ul className="flex flex-col gap-0.5">
        {[
          { label: "Overview", active: true, badge: null },
          { label: "Components", active: false, badge: "9" },
          { label: "Inbox", active: false, badge: "3" },
          { label: "Activity", active: false, badge: null },
          { label: "Settings", active: false, badge: null },
        ].map((item) => (
          <li key={item.label}>
            <div
              className={cn(
                "flex h-8 items-center justify-between rounded-md px-2 text-sm transition-colors",
                item.active
                  ? "bg-card text-foreground font-medium border border-border"
                  : "text-muted-foreground",
              )}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="rounded bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {item.badge}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2 text-xs text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
          shadcn powered, motion driven
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          shadcn primitives + curated motion lib.
        </p>
      </div>
    </div>
  );
}

function MainPanel() {
  const [notifs, setNotifs] = useState(true);

  return (
    <div className="bg-background/40 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Monthly recurring</p>
          <div className="mt-1 flex items-baseline gap-2">
            <NumberTicker
              value={129480}
              prefix="$"
              locale
              className="text-3xl font-semibold tracking-tight text-foreground"
            />
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-medium text-emerald-500">
              <ArrowUpRight className="h-3 w-3" />
              12.4%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-transform hover:text-foreground active:scale-[0.97]">
            <Bell className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs text-foreground transition-transform active:scale-[0.97]">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            Search
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-5">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Spark />
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Active" value={2841} />
            <Stat label="New" value={319} />
            <Stat label="Churn" value={1.2} suffix="%" />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ul className="flex flex-col gap-2">
            {[
              { who: "Ada", what: "shipped v2.0.0", when: "2m ago" },
              { who: "Linus", what: "opened PR #142", when: "14m ago" },
              { who: "Grace", what: "merged auth refactor", when: "1h ago" },
            ].map((row) => (
              <li
                key={row.who}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-foreground">
                    {row.who[0]}
                  </span>
                  <span className="text-foreground">
                    <span className="font-medium">{row.who}</span>{" "}
                    <span className="text-muted-foreground">{row.what}</span>
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{row.when}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Email me when invoices are paid.</p>
            </div>
            <Switch checked={notifs} onCheckedChange={setNotifs} />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              Plan: Pro
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <NumberTicker
        value={value}
        suffix={suffix}
        locale
        className="mt-1 text-lg font-semibold text-foreground"
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
    <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Last 14 days</p>
        <p className="text-xs font-medium text-foreground">+24%</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-16 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark)" />
        <path d={path} fill="none" stroke="var(--brand-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
