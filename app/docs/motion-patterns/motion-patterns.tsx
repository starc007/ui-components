"use client";

import {
  Bell,
  MousePointer2,
  PanelTopOpen,
  RefreshCw,
  Rows3,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { useState, type ReactNode } from "react";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { cn } from "@/lib/utils";

type Pattern = {
  title: string;
  short: string;
  spec: string;
  icon: LucideIcon;
  demo: "icon" | "reveal" | "press" | "expand" | "page";
  ask: string;
  shape: string;
  avoid: string;
  code: string;
};

const patterns: Pattern[] = [
  {
    title: "Icon motion",
    short: "Move icons like the action.",
    spec: "480-720ms",
    icon: Bell,
    demo: "icon",
    ask: "Make the icon move like its real action.",
    shape: "Bell swings from the top. Download drops. Copy snaps once.",
    avoid: "Do not use one generic bounce for every icon.",
    code: `// Bell should swing from the top, not bounce.
hover: {
  rotate: [0, 14, -12, 8, -5, 0],
  transformOrigin: "top center",
  transition: { duration: 0.68, ease: easeOut }
}`,
  },
  {
    title: "Reveal",
    short: "Show content softly.",
    spec: "480-560ms",
    icon: Sparkles,
    demo: "reveal",
    ask: "Reveal new content gently, not instantly.",
    shape: "Fade in, lift 12px, remove blur slowly.",
    avoid: "Do not stagger every tiny child. Reveal the main surface first.",
    code: `initial: { opacity: 0, y: 12, filter: "blur(6px)" }
animate: { opacity: 1, y: 0, filter: "blur(0px)" }
transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] }`,
  },
  {
    title: "Press",
    short: "Make taps feel physical.",
    spec: "120-180ms",
    icon: MousePointer2,
    demo: "press",
    ask: "Make taps feel quick and physical.",
    shape: "Scale down a little, then return fast.",
    avoid: "Do not make buttons rubbery or slow.",
    code: `whileTap: { scale: 0.97 }
transition: {
  type: "spring",
  stiffness: 500,
  damping: 32
}`,
  },
  {
    title: "Expand",
    short: "Open without layout jumps.",
    spec: "260-360ms",
    icon: PanelTopOpen,
    demo: "expand",
    ask: "Open the shape first, then reveal the content.",
    shape: "Start as a tight icon. Expand on hover, focus or click. Text fades in after the shape moves.",
    avoid: "Do not animate size and text at the exact same time.",
    code: `expanded = open || hovered || focused

container: { width: expanded ? 136 : 44 }
label: {
  opacity: expanded ? 1 : 0,
  transition: { delay: expanded ? 0.06 : 0 }
}
// Shape moves first. Text follows.`,
  },
  {
    title: "Page shift",
    short: "Change views quietly.",
    spec: "160-240ms",
    icon: Rows3,
    demo: "page",
    ask: "Change views quietly.",
    shape: "Old view exits fast. New view fades in with a 4px move.",
    avoid: "Do not use big page motion for small tab changes.",
    code: `exit: { opacity: 0, y: -4, transition: { duration: 0.12 } }
enter: { opacity: 1, y: 0, transition: { duration: 0.18 } }
initial: { opacity: 0, y: 4 }`,
  },
];

export function MotionPatterns() {
  const [active, setActive] = useState<Pattern | null>(null);

  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {patterns.map((pattern) => {
          const Icon = pattern.icon;

          return (
            <button
              key={pattern.title}
              type="button"
              onClick={() => setActive(pattern)}
              className="group min-h-32 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-(--color-border-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
                </span>
                <span className="rounded-full border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  {pattern.spec}
                </span>
              </div>
              <h2 className="mt-4 font-pixel text-base uppercase text-foreground">
                {pattern.title}
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {pattern.short}
              </p>
            </button>
          );
        })}
      </div>

      <BottomSheet
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        snapPoints={[0.74, 0.92]}
        title={active?.title}
        description={active?.short}
      >
        {active ? <PatternDetails pattern={active} /> : null}
      </BottomSheet>
    </>
  );
}

function PatternDetails({ pattern }: { pattern: Pattern }) {
  const rows = [
    { label: "Ask for", value: pattern.ask },
    { label: "Shape", value: pattern.shape },
    { label: "Avoid", value: pattern.avoid },
  ];

  return (
    <div className="space-y-3 pt-2">
      <section className="rounded-2xl border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-pixel text-sm uppercase text-foreground">
            Live example
          </h3>
          <span className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            {pattern.spec}
          </span>
        </div>
        <LiveExample pattern={pattern} />
      </section>

      <section className="rounded-2xl border border-border bg-background p-4">
        <h3 className="font-pixel text-sm uppercase text-foreground">
          Simple guide
        </h3>
        <div className="mt-3 grid gap-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-4"
            >
              <p className="pt-1 font-mono text-[11px] uppercase text-muted-foreground">
                {row.label}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-4">
        <h3 className="font-pixel text-sm uppercase text-foreground">
          Pseudo code
        </h3>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-card p-3 text-xs leading-6 text-foreground">
          <code>{pattern.code}</code>
        </pre>
      </section>
    </div>
  );
}

function LiveExample({ pattern }: { pattern: Pattern }) {
  const [replay, setReplay] = useState(0);
  const [open, setOpen] = useState(false);
  const [hoverExpand, setHoverExpand] = useState(false);
  const [tab, setTab] = useState("Preview");

  if (pattern.demo === "icon") {
    return (
      <DemoFrame>
        <button
          type="button"
          className="group inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground"
        >
          <Bell className="h-4 w-4 origin-top motion-safe:group-hover:animate-action-bell" />
          Hover bell
        </button>
      </DemoFrame>
    );
  }

  if (pattern.demo === "reveal") {
    return (
      <DemoFrame
        action={
          <ReplayButton onClick={() => setReplay((current) => current + 1)} />
        }
      >
        <motion.div
          key={replay}
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.52, ease: EASE_OUT }}
          className="w-56 rounded-2xl bg-card p-4"
        >
          <p className="font-pixel text-sm uppercase text-foreground">New card</p>
          <p className="mt-2 text-sm text-muted-foreground">Soft reveal with lift.</p>
        </motion.div>
      </DemoFrame>
    );
  }

  if (pattern.demo === "press") {
    return (
      <DemoFrame>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          Press me
        </motion.button>
      </DemoFrame>
    );
  }

  if (pattern.demo === "expand") {
    const expanded = open || hoverExpand;

    return (
      <DemoFrame>
        <motion.button
          type="button"
          aria-expanded={expanded}
          onClick={() => setOpen((current) => !current)}
          onMouseEnter={() => setHoverExpand(true)}
          onMouseLeave={() => setHoverExpand(false)}
          onFocus={() => setHoverExpand(true)}
          onBlur={() => setHoverExpand(false)}
          animate={{ width: expanded ? 136 : 44 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="relative h-11 overflow-hidden rounded-full border border-border bg-card text-left"
        >
          <motion.span
            animate={{ opacity: expanded ? 0 : 1 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <PanelTopOpen className="h-4 w-4 text-foreground" />
          </motion.span>
          <motion.span
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.12, delay: expanded ? 0.04 : 0 }}
            className="absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center"
          >
            <PanelTopOpen className="h-4 w-4 text-foreground" />
          </motion.span>
          <motion.span
            animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : -4 }}
            transition={{ duration: 0.18, delay: expanded ? 0.06 : 0 }}
            className="absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-foreground"
          >
            Open panel
          </motion.span>
        </motion.button>
      </DemoFrame>
    );
  }

  return (
    <DemoFrame>
      <div className="w-64 rounded-2xl bg-card p-2">
        <div className="grid grid-cols-2 gap-1">
          {["Preview", "Code"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition-colors",
                tab === item
                  ? "bg-foreground text-background"
                  : "text-muted-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="mt-3 rounded-xl bg-background p-4 text-sm text-foreground"
          >
            {tab === "Preview" ? "Live component view" : "Code sample view"}
          </motion.div>
        </AnimatePresence>
      </div>
    </DemoFrame>
  );
}

function DemoFrame({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-card p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase text-muted-foreground">
          Try it
        </span>
        {action}
      </div>
      <div className="flex min-h-32 items-center justify-center rounded-xl bg-background p-4">
        {children}
      </div>
    </div>
  );
}

function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground"
    >
      <RefreshCw className="h-3 w-3" />
      Replay
    </button>
  );
}
