"use client";

import { useEffect, useMemo, useState } from "react";
import {
  InlineStatusRow,
  type InlineStatusRowStatus,
} from "@/components/motion/inline-status-row";

const FLOW: Array<{
  status: InlineStatusRowStatus;
  title: string;
  description: string;
  progress: number;
  meta: string;
}> = [
  {
    status: "queued",
    title: "Queued sandbox build",
    description: "Waiting for an available runner.",
    progress: 8,
    meta: "00:02",
  },
  {
    status: "running",
    title: "Installing dependencies",
    description: "Resolving packages and preparing the workspace.",
    progress: 42,
    meta: "00:18",
  },
  {
    status: "running",
    title: "Running checks",
    description: "Typecheck and registry validation are in progress.",
    progress: 72,
    meta: "00:31",
  },
  {
    status: "success",
    title: "Build complete",
    description: "All checks passed and artifacts are ready.",
    progress: 100,
    meta: "00:44",
  },
];

export function InlineStatusRowPreview() {
  const [active, setActive] = useState(0);
  const current = FLOW[active];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % FLOW.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, []);

  const details = useMemo(
    () => (
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <span className="block text-[11px] uppercase tracking-normal text-(--color-fg-muted)">
            Runner
          </span>
          <span className="font-medium text-(--color-fg)">iad-build-04</span>
        </div>
        <div>
          <span className="block text-[11px] uppercase tracking-normal text-(--color-fg-muted)">
            Branch
          </span>
          <span className="font-medium text-(--color-fg)">feat/status-row</span>
        </div>
        <div>
          <span className="block text-[11px] uppercase tracking-normal text-(--color-fg-muted)">
            Queue
          </span>
          <span className="font-medium text-(--color-fg)">priority</span>
        </div>
      </div>
    ),
    [],
  );

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <InlineStatusRow
        status={current.status}
        title={current.title}
        description={current.description}
        progress={current.progress}
        meta={current.meta}
        details={details}
        defaultExpanded
      />

      <InlineStatusRow
        status="warning"
        title="Manual review needed"
        description="A generated diff touched a shared primitive."
        progress={64}
        meta="review"
        details="Open the expanded row to show contextual notes, logs, or next actions without taking the user out of the list."
      />

      <InlineStatusRow
        status="error"
        title="Deploy failed"
        description="The preview worker returned a non-200 response."
        progress={38}
        meta="failed"
        details="Surface the actual failure context here: command, exit code, affected route, or retry hint."
      />
    </div>
  );
}
