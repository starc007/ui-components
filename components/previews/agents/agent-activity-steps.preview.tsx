"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { AgentActivity } from "@/components/agents/agent-activity";

const STEPS = [
  { id: "brief", label: "Reading the product brief" },
  { id: "patterns", label: "Mapping the interaction patterns" },
  {
    id: "states",
    label: "Connecting the loading and completion states",
    meta: "3 states",
  },
  { id: "verify", label: "Verifying the final behavior" },
];

function StepsDemo() {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(reduce ? STEPS.length : 1);
  const [settled, setSettled] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (reduce) {
      setVisible(STEPS.length);
      setSettled(true);
      setComplete(true);
      return;
    }

    const stepTimers = STEPS.slice(1).map((_, index) =>
      window.setTimeout(() => setVisible(index + 2), 850 + index * 800),
    );
    const settleTimer = window.setTimeout(() => setSettled(true), 3300);
    const completeTimer = window.setTimeout(() => setComplete(true), 4200);
    return () => {
      stepTimers.forEach(window.clearTimeout);
      window.clearTimeout(settleTimer);
      window.clearTimeout(completeTimer);
    };
  }, [reduce]);

  return (
    <AgentActivity
      status={complete ? "complete" : "working"}
      contentType="step"
      duration={4.2}
      defaultOpen={reduce}
      collapseOnComplete={!reduce}
      maxHeight={220}
      items={STEPS.slice(0, visible).map((step, index) => ({
        ...step,
        type: "step" as const,
        status:
          settled || index < visible - 1
            ? ("complete" as const)
            : ("active" as const),
      }))}
    />
  );
}

export function AgentActivityStepsPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[330px] w-full max-w-lg">
      <StepsDemo key={run} />
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
