"use client";

import { Activity, Layers, Zap } from "lucide-react";
import { SpotlightCard } from "@/components/motion/spotlight-card";

export function SpotlightCardPreview() {
  const items = [
    { icon: Zap, title: "Instant feedback", body: "Sub-100ms interactions across every surface." },
    { icon: Layers, title: "Composable", body: "Stack primitives without fighting the system." },
    { icon: Activity, title: "Always alive", body: "Subtle motion that makes UI feel grounded." },
  ];
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
      {items.map(({ icon: Icon, title, body }) => (
        <SpotlightCard key={title} className="p-5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-accent)">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-(--color-fg)">{title}</h3>
          <p className="mt-1 text-sm text-(--color-fg-muted)">{body}</p>
        </SpotlightCard>
      ))}
    </div>
  );
}
