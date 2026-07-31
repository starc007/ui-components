"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  AgentActivity,
  type AgentActivityItem,
} from "@/components/agents/agent-activity";

const TOOLS: AgentActivityItem[] = [
  {
    id: "read",
    type: "tool",
    action: "read",
    target: "campaign-notes.md",
  },
  {
    id: "edit",
    type: "tool",
    action: "edit",
    target: "launch-plan.ts",
    additions: 42,
    deletions: 8,
  },
  {
    id: "run",
    type: "tool",
    action: "run",
    target: "bun test launch",
  },
];

function ToolsDemo() {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (reduce) {
      setVisible(TOOLS.length);
      setComplete(true);
      return;
    }

    const toolTimers = TOOLS.map((_, index) =>
      window.setTimeout(() => setVisible(index + 1), 550 + index * 850),
    );
    const completeTimer = window.setTimeout(() => setComplete(true), 3600);
    return () => {
      toolTimers.forEach(window.clearTimeout);
      window.clearTimeout(completeTimer);
    };
  }, [reduce]);

  return (
    <AgentActivity
      status={complete ? "complete" : "working"}
      contentType="tool"
      defaultOpen={reduce}
      collapseOnComplete={!reduce}
      maxHeight={220}
      items={TOOLS.slice(0, visible)}
    />
  );
}

export function AgentActivityToolsPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[330px] w-full max-w-lg">
      <ToolsDemo key={run} />
      <button
        type="button"
        onClick={() => setRun((current) => current + 1)}
        className="absolute bottom-0 left-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
