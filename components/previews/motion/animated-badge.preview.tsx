"use client";

import { useEffect, useState } from "react";
import { AnimatedBadge, type AnimatedBadgeStatus } from "@/components/motion/animated-badge";

const STATES: Array<{ status: AnimatedBadgeStatus; label: string }> = [
  { status: "loading", label: "Syncing" },
  { status: "success", label: "Synced" },
  { status: "warning", label: "Review" },
  { status: "danger", label: "Failed" },
];

export function AnimatedBadgePreview() {
  const [active, setActive] = useState(0);
  const state = STATES[active];

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % STATES.length);
    }, 1600);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex h-16 items-center justify-center">
        <AnimatedBadge status={state.status} size="md" aria-live="polite">
          {state.label}
        </AnimatedBadge>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <AnimatedBadge status="neutral" size="sm">Queued</AnimatedBadge>
        <AnimatedBadge status="info" size="sm">Live</AnimatedBadge>
        <AnimatedBadge status="loading" size="sm">Indexing</AnimatedBadge>
        <AnimatedBadge status="success" size="sm">Verified</AnimatedBadge>
        <AnimatedBadge status="warning" size="sm">Pending</AnimatedBadge>
        <AnimatedBadge status="danger" size="sm">Blocked</AnimatedBadge>
      </div>
    </div>
  );
}
