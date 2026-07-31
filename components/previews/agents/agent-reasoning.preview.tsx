"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentReasoning } from "@/components/agents/agent-reasoning";

const REASONING = [
  "Reading the request and identifying the interaction states.",
  "Checking the existing agent components for shared motion and type conventions.",
  "Separating the live reasoning stream from the completed disclosure state.",
  "Preparing an accessible controlled API with reduced-motion behavior.",
];

function ReasoningDemo() {
  const [visible, setVisible] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setVisible(0);
    setComplete(false);

    const timers = REASONING.map((_, index) =>
      window.setTimeout(() => setVisible(index + 1), 650 + index * 900),
    );
    timers.push(window.setTimeout(() => setComplete(true), 4500));

    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <AgentReasoning
      status={complete ? "complete" : "thinking"}
      duration={4.5}
    >
      {REASONING.slice(0, visible).map((line) => (
        <p key={line}>{line}</p>
      ))}
    </AgentReasoning>
  );
}

export function AgentReasoningPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="w-full max-w-lg">
      <ReasoningDemo key={run} />

      <button
        type="button"
        onClick={() => setRun((current) => current + 1)}
        className="mt-5 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
