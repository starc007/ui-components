"use client";

// Internal design reference for brand.md. Dev only: not in the sitemap, so the
// static build never renders it.

import { Copy, Download, Search, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/motion/button";
import { Checkbox } from "@/components/motion/checkbox";
import { Input } from "@/components/motion/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { Switch } from "@/components/motion/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { cn } from "@/lib/utils";

function Section({ title, rule, children }: { title: string; rule: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-medium tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{rule}</p>
      </div>
      {children}
    </section>
  );
}

function Card({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl border border-border p-5", className)}>
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
      {children}
    </div>
  );
}

function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "bad" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 font-mono text-[11px] font-medium",
        tone === "neutral" && "bg-card text-muted-foreground",
        tone === "good" && "bg-success/15 text-success",
        tone === "bad" && "bg-destructive/15 text-destructive",
      )}
    >
      {children}
    </span>
  );
}

const FAMILIES = [
  { name: "Plus Jakarta Sans", role: "Headings", className: "font-display", sample: "The motion toolkit" },
  { name: "Inter", role: "Body and UI", className: "font-sans", sample: "Copy the source and make it yours." },
  { name: "JetBrains Mono", role: "Code and numbers", className: "font-mono", sample: "npx shadcn add @beui/tabs" },
];

const SCALE = [
  { role: "Display", className: "font-display text-5xl font-semibold tracking-tight", meta: "48 / 48 · 600" },
  { role: "Page title", className: "font-display text-3xl font-medium tracking-tight", meta: "30 / 36 · 500" },
  { role: "Section title", className: "font-display text-xl font-medium tracking-tight", meta: "20 / 28 · 500" },
  { role: "Subsection", className: "text-base font-medium", meta: "16 / 24 · 500" },
  { role: "Body and UI", className: "text-sm", meta: "14 / 20 · 400" },
  { role: "Caption", className: "text-xs text-muted-foreground", meta: "12 / 16 · 400" },
  { role: "Micro", className: "text-[11px] font-medium text-muted-foreground", meta: "11 / 16 · 500" },
  { role: "Code", className: "font-mono text-[13px]", meta: "13 / 20 · 400" },
];

const COLORS = [
  { token: "background", use: "Page" },
  { token: "card", use: "Raised surfaces" },
  { token: "foreground", use: "Text" },
  { token: "muted-foreground", use: "Secondary text" },
  { token: "border", use: "Hairlines" },
  { token: "border-strong", use: "Inputs, focus" },
  { token: "primary", use: "Filled emphasis" },
  { token: "accent", use: "Small highlights" },
  { token: "success", use: "Status" },
  { token: "warning", use: "Status" },
  { token: "danger", use: "Status" },
];

const MOTION = [
  { token: "EASE_OUT", use: "Most entrances and transitions", value: "cubic-bezier(0.16, 1, 0.3, 1)" },
  { token: "EASE_IN", use: "Falls and exits only", value: "cubic-bezier(0.55, 0, 1, 0.45)" },
  { token: "SPRING_PRESS", use: "Press feedback", value: "500 / 30 / 0.6" },
  { token: "SPRING_SWAP", use: "Label and icon swaps", value: "460 / 30 / 0.55" },
  { token: "SPRING_PANEL", use: "Modals and sheets", value: "420 / 40 / 0.5" },
  { token: "SPRING_LAYOUT", use: "Sliding pills and indicators", value: "360 / 32 / 0.6" },
];

/** A floating panel drawn to the system: rounded-3xl, p-2, h-8 pill rows. */
function PanelMock({ rows, active }: { rows: string[]; active: number }) {
  return (
    <div className="w-56 rounded-3xl border border-border bg-background p-2 shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)]">
      {rows.map((row, index) => (
        <div
          key={row}
          className={cn(
            "flex h-8 items-center rounded-full px-3 text-sm text-foreground",
            index === active && "bg-card",
          )}
        >
          {row}
        </div>
      ))}
    </div>
  );
}

export function BrandPage() {
  const [framework, setFramework] = useState("next");
  const [notify, setNotify] = useState(true);
  const [agree, setAgree] = useState(true);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">beUI brand</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          One shape language: every control is a pill, every container is rounded and concentric. This page
          renders brand.md with real components.
        </p>
      </header>

      <Section title="Typography" rule="Jakarta for headings, Inter for UI, JetBrains Mono for code and changing numbers.">
        <div className="grid gap-4 md:grid-cols-3">
          {FAMILIES.map((family) => (
            <Card key={family.name} label={family.role}>
              <span className={cn("text-2xl font-medium tracking-tight text-foreground", family.className)}>
                {family.name}
              </span>
              <span className={cn("text-sm text-muted-foreground", family.className)}>{family.sample}</span>
            </Card>
          ))}
        </div>
        <Card>
          <div className="flex flex-col divide-y divide-border">
            {SCALE.map((step) => (
              <div key={step.role} className="grid grid-cols-[7rem_1fr_auto] items-baseline gap-4 py-3">
                <span className="text-xs text-muted-foreground">{step.role}</span>
                <span className={cn("truncate text-foreground", step.className)}>Animated components</span>
                <span className="font-mono text-[11px] text-muted-foreground">{step.meta}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Radius" rule="Controls are rounded-full. Panels rounded-3xl, cards rounded-2xl, dialogs rounded-3xl.">
        <Card label="Controls · rounded-full">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Continue</Button>
            <Button variant="secondary">
              <Download className="size-4" />
              Download
            </Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary" size="icon" aria-label="Delete">
              <Trash2 className="size-4" />
            </Button>
            <Tabs defaultValue="day" variant="pill">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            <Switch checked={notify} onCheckedChange={setNotify} label="Notify" />
            <Tag>Badge</Tag>
          </div>
          <div className="max-w-xs">
            <Input placeholder="Search components" leftIcon={<Search className="size-4" />} />
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card label="Select · pill trigger, rounded-3xl panel, pill rows">
            <div className="w-48">
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="remix">Remix</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card label="Floating panel · rounded-3xl, p-2, rows rounded-full h-8">
            <div className="flex flex-wrap items-start gap-6">
              <PanelMock rows={["Next.js", "Remix", "Astro", "Vite"]} active={1} />
              <div className="flex flex-col gap-1 font-mono text-[11px] text-muted-foreground">
                <span>panel 24px</span>
                <span>− padding 8px</span>
                <span className="text-foreground">= row 16px (pill at h-8)</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card label="Card · rounded-2xl">
            <div className="h-20 rounded-2xl border border-border" />
          </Card>
          <Card label="Dialog, sheet · rounded-3xl">
            <div className="h-20 rounded-3xl border border-border" />
          </Card>
          <Card label="Nested · inner = outer − gap">
            <div className="rounded-3xl border border-border p-2">
              <div className="h-14 rounded-2xl bg-card" />
            </div>
          </Card>
        </div>

        <Card label="Exceptions">
          <div className="flex flex-wrap items-start gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Checkbox stays rounded-md</span>
              <Checkbox checked={agree} onCheckedChange={setAgree} label="Accept terms" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Multi-line input · rounded-3xl</span>
              <div className="flex h-20 w-64 items-start rounded-3xl border border-border-strong px-4 py-3 text-sm text-muted-foreground">
                Ask anything
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Chart marks keep 2 to 4px</span>
              <div className="flex h-20 items-end gap-1.5">
                {[40, 64, 52, 80, 36].map((h) => (
                  <div key={h} className="w-5 rounded-[3px] bg-primary" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Size" rule="sm h-8, md h-10, lg h-12. Every control in a row shares one height.">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button variant="secondary" size="icon" aria-label="Copy">
              <Copy className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 font-mono text-[11px] text-muted-foreground">
            <span>sm · 32 · px-3 · text-xs · icon 14</span>
            <span>md · 40 · px-5 · text-sm · icon 16</span>
            <span>lg · 48 · px-6 · text-base · icon 16</span>
            <span>row · 32 · px-3 · text-sm</span>
          </div>
        </Card>
      </Section>

      <Section title="Color" rule="Monochrome. Near-black primary (white in dark mode) for filled emphasis, status colors for status only. No purple.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {COLORS.map((color) => (
            <div key={color.token} className="flex items-center gap-3 rounded-2xl border border-border p-3">
              <span
                className="size-9 shrink-0 rounded-full border border-border"
                style={{ background: `var(--${color.token})` }}
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-mono text-xs text-foreground">
                  {color.token}
                </span>
                <span className="truncate text-xs text-muted-foreground">{color.use}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Surfaces" rule="Cards are border-only. Floating panels get the one shadow in the system.">
        <div className="grid gap-4 md:grid-cols-2">
          <Card label="Card · border, no shadow, no fill">
            <span className="text-sm text-foreground">Monthly revenue</span>
            <span className="font-mono text-2xl tabular-nums text-foreground">$12,480</span>
          </Card>
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-border p-6">
            <PanelMock rows={["Edit", "Duplicate", "Delete"]} active={0} />
          </div>
        </div>
      </Section>

      <Section title="Motion" rule="Tokens from lib/ease.ts. Under 300ms, exits faster, transform and opacity only.">
        <Card>
          <div className="flex flex-col divide-y divide-border">
            {MOTION.map((m) => (
              <div key={m.token} className="grid grid-cols-[9rem_1fr_auto] items-center gap-4 py-2.5">
                <span className="font-mono text-xs text-foreground">{m.token}</span>
                <span className="text-sm text-muted-foreground">{m.use}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{m.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </main>
  );
}
