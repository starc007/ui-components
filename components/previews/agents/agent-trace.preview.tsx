"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  AgentActivity,
  type AgentActivityItem,
} from "@/components/agents/agent-activity";

const TRACE_ITEMS: AgentActivityItem[] = [
  {
    id: "plan",
    type: "trace",
    kind: "thinking",
    label: "Thinking",
    detail: "Mapping the interaction flow…",
  },
  {
    id: "decision",
    type: "trace",
    kind: "message",
    label: "Decision",
    detail: "Use one compact disclosure",
  },
  {
    id: "write",
    type: "trace",
    kind: "write",
    label: "Draft component",
    detail: "components/agents/run-log.tsx",
  },
  {
    id: "verify",
    type: "trace",
    kind: "run",
    label: "Validate types",
    detail: "bun run typecheck",
  },
  {
    id: "inspect",
    type: "trace",
    kind: "read",
    label: "Inspect preview",
    detail: "activity-preview.png",
  },
];

function AgentTraceDemo() {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(reduce ? TRACE_ITEMS.length : 0);
  const [complete, setComplete] = useState(reduce);

  useEffect(() => {
    if (reduce) return;

    const timers = TRACE_ITEMS.map((_, index) =>
      window.setTimeout(() => setVisible(index + 1), 250 + index * 650),
    );
    timers.push(
      window.setTimeout(
        () => setComplete(true),
        250 + TRACE_ITEMS.length * 650,
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  return (
    <AgentActivity
      items={TRACE_ITEMS.slice(0, visible)}
      contentType="trace"
      status={complete ? "complete" : "working"}
      activeLabel="Running the agent trace…"
      defaultOpen={reduce}
      collapseOnComplete={!reduce}
      maxHeight={190}
    />
  );
}

export function AgentTracePreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[300px] w-full max-w-xl">
      <AgentTraceDemo key={run} />
      <button
        type="button"
        onClick={() => setRun((value) => value + 1)}
        className="absolute bottom-0 left-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
