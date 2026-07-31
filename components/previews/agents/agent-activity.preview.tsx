"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  AgentActivity,
  type AgentActivityItem,
} from "@/components/agents/agent-activity";

const ACTIVE_BRIEF: AgentActivityItem = {
  id: "brief",
  type: "step",
  label: "Reading the launch brief",
  status: "active",
};

const COMPLETE_BRIEF: AgentActivityItem = {
  ...ACTIVE_BRIEF,
  status: "complete",
};

const PENDING_SEARCH: AgentActivityItem = {
  id: "search",
  type: "search",
  query: "independent coffee roasters in Portland",
  results: [],
};

const COMPLETE_SEARCH: AgentActivityItem = {
  ...PENDING_SEARCH,
  results: [
    { id: "heart", title: "Heart Coffee", domain: "heartroasters.com" },
    {
      id: "coava",
      title: "Coava Coffee",
      domain: "coavacoffee.com",
    },
    {
      id: "upper-left",
      title: "Upper Left Roasters",
      domain: "upperleftroasters.com",
    },
  ],
  moreCount: 5,
};

const READ_TOOL: AgentActivityItem = {
  id: "read",
  type: "tool",
  action: "read",
  target: "campaign-notes.md",
};

const ACTIVITY_FRAMES: AgentActivityItem[][] = [
  [ACTIVE_BRIEF],
  [COMPLETE_BRIEF, PENDING_SEARCH],
  [COMPLETE_BRIEF, COMPLETE_SEARCH],
  [COMPLETE_BRIEF, COMPLETE_SEARCH, READ_TOOL],
  [
    COMPLETE_BRIEF,
    COMPLETE_SEARCH,
    READ_TOOL,
    {
      id: "edit",
      type: "tool",
      action: "edit",
      target: "launch-plan.ts",
      additions: 42,
      deletions: 8,
    },
    { id: "run", type: "tool", action: "run", target: "bun test launch" },
    {
      id: "verify",
      type: "step",
      label: "Checking the final campaign plan",
      status: "complete",
    },
  ],
];

function ActivityDemo() {
  const reduce = useReducedMotion() ?? false;
  const [frame, setFrame] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (reduce) {
      setFrame(ACTIVITY_FRAMES.length - 1);
      setComplete(true);
      return;
    }

    const timers = ACTIVITY_FRAMES.slice(1).map((_, index) =>
      window.setTimeout(() => setFrame(index + 1), 850 + index * 1050),
    );
    const finalFrameAt = 850 + (ACTIVITY_FRAMES.length - 2) * 1050;
    const completeTimer = window.setTimeout(
      () => setComplete(true),
      finalFrameAt + 900,
    );
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(completeTimer);
    };
  }, [reduce]);

  return (
    <AgentActivity
      items={ACTIVITY_FRAMES[frame]}
      status={complete ? "complete" : "working"}
      duration={5.1}
      defaultOpen={reduce}
      collapseOnComplete={!reduce}
      maxHeight={220}
    />
  );
}

export function AgentActivityMixedPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[330px] w-full max-w-xl">
      <ActivityDemo key={run} />
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
