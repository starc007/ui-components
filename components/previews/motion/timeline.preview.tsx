"use client";

import { Heart } from "lucide-react";
import { Timeline, type TimelineEvent } from "@/components/motion/timeline";

function Likes({ count }: { count: string }) {
  return (
    <>
      <Heart aria-hidden="true" className="size-4" />
      <span>{count}</span>
    </>
  );
}

function ChartMedia({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 56 - (p / max) * 44;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 64"
      preserveAspectRatio="none"
      className="size-full text-foreground"
      role="img"
      aria-label="Rising line chart"
    >
      <path d={`${path} L100 64 L0 64 Z`} className="fill-foreground/[0.06]" />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function PhoneMedia() {
  return (
    <div className="flex size-full items-end justify-center bg-muted/40 pt-5">
      <div className="flex h-full w-1/2 flex-col gap-2 rounded-t-3xl border border-b-0 border-border bg-background p-3">
        <div className="mx-auto h-1.5 w-8 rounded-full bg-foreground/15" />
        <div className="h-3 w-2/3 rounded-full bg-foreground/15" />
        <div className="h-16 rounded-xl bg-foreground/[0.06]" />
        <div className="h-2 w-full rounded-full bg-foreground/10" />
        <div className="h-2 w-4/5 rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}

function SyncMedia() {
  return (
    <div className="flex size-full items-center justify-center gap-3 bg-muted/40 p-5">
      <div className="flex h-full flex-1 flex-col gap-2 rounded-xl border border-border bg-background p-3">
        <div className="flex gap-1">
          <span className="size-1.5 rounded-full bg-foreground/20" />
          <span className="size-1.5 rounded-full bg-foreground/20" />
          <span className="size-1.5 rounded-full bg-foreground/20" />
        </div>
        <div className="h-2 w-3/4 rounded-full bg-foreground/15" />
        <div className="h-2 w-full rounded-full bg-foreground/10" />
        <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
      </div>
      <div className="flex h-4/5 w-1/4 flex-col gap-2 rounded-2xl border border-border bg-background p-2">
        <div className="h-2 w-3/4 rounded-full bg-foreground/15" />
        <div className="h-2 w-full rounded-full bg-foreground/10" />
        <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}

function GridMedia() {
  return (
    <div className="grid size-full grid-cols-3 gap-2 bg-muted/40 p-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static decoration
          key={i}
          className="rounded-xl border border-border bg-background"
          style={{ opacity: 1 - i * 0.1 }}
        />
      ))}
    </div>
  );
}

function KeysMedia() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted/40">
      <div className="flex gap-1.5">
        {["⌘", "K"].map((key) => (
          <kbd
            key={key}
            className="flex size-11 items-center justify-center rounded-xl border border-border bg-background font-sans text-foreground text-lg shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
      <div className="h-2 w-28 rounded-full bg-foreground/10" />
    </div>
  );
}

function ReleaseMedia() {
  return (
    <div className="flex size-full items-center justify-center bg-foreground text-background">
      <span className="font-medium text-5xl tracking-tighter">2.0</span>
    </div>
  );
}

const EVENTS: TimelineEvent[] = [
  {
    id: "beta",
    date: "2025-06-12",
    title: "Private beta opens",
    media: <GridMedia />,
    meta: <Likes count="1,204" />,
  },
  {
    id: "android",
    date: "2025-08-03",
    title: "Lumen for Android",
    media: <PhoneMedia />,
    meta: <Likes count="3,918" />,
  },
  {
    id: "offline",
    date: "2025-10-14",
    title: "Offline drafts",
    media: <SyncMedia />,
    meta: <Likes count="4,827" />,
  },
  {
    id: "signups",
    date: "2025-11-20",
    title: "Weekly signups double",
    media: <ChartMedia points={[4, 5, 4, 6, 5, 7, 6, 9, 8, 12, 11, 15]} />,
    meta: <Likes count="6,175" />,
  },
  {
    id: "spaces",
    date: "2026-01-09",
    title: "Shared spaces",
    media: <GridMedia />,
    meta: <Likes count="2,640" />,
  },
  {
    id: "command",
    date: "2026-03-17",
    title: "The command menu",
    media: <KeysMedia />,
    meta: <Likes count="5,302" />,
  },
  {
    id: "rank",
    date: "2026-05-28",
    title: "Top 10 in productivity",
    media: <ChartMedia points={[3, 4, 6, 5, 8, 9, 8, 11, 13, 12, 14, 16]} />,
    meta: <Likes count="13,916" />,
  },
  {
    id: "two",
    date: "2026-08-05",
    title: "Lumen 2.0",
    media: <ReleaseMedia />,
    meta: <Likes count="27,130" />,
  },
];

export function TimelinePreview() {
  return (
    <div className="w-full py-6">
      <Timeline
        events={EVENTS}
        defaultValue="signups"
        aria-label="Lumen release history"
      />
    </div>
  );
}
