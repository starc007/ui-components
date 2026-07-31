"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { AgentReasoning } from "@/components/agents/agent-reasoning";

const REASONING = [
  "Mapping the request into active, settled, and reopened states.",
  "Keeping the worklog visible while new details arrive.",
  "Reviewing the surrounding component API so the new behavior remains composable.",
  "Checking how the content grows when a streamed sentence wraps onto another line.",
  "Capping the viewport before the worklog pushes the rest of the page downward.",
  "Following the newest output automatically while the agent is still working.",
  "Preserving manual scrolling once the run is complete so earlier details remain readable.",
  "Tuning the transition to stay calm during longer tasks.",
  "Verifying keyboard access, reduced motion, and the expanded disclosure state.",
  "Finishing with a compact summary that can be revisited.",
].join("\n");

const STREAM_CHARACTERS_PER_SECOND = 90;
const STREAM_SECONDS = REASONING.length / STREAM_CHARACTERS_PER_SECOND;

function ReasoningDemo() {
  const reduce = useReducedMotion() ?? false;
  const [stream, setStream] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (reduce) {
      setStream(REASONING);
      setComplete(true);
      return;
    }

    const startedAt = performance.now();
    let frame = 0;
    let completionTimer: number | undefined;

    const streamNextFrame = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const cursor = Math.min(
        REASONING.length,
        Math.floor(elapsed * STREAM_CHARACTERS_PER_SECOND),
      );
      const next = REASONING.slice(0, cursor);
      setStream((current) => (current === next ? current : next));

      if (cursor === REASONING.length) {
        completionTimer = window.setTimeout(() => setComplete(true), 500);
      } else {
        frame = requestAnimationFrame(streamNextFrame);
      }
    };

    frame = requestAnimationFrame(streamNextFrame);

    return () => {
      cancelAnimationFrame(frame);
      if (completionTimer) window.clearTimeout(completionTimer);
    };
  }, [reduce]);

  const lines = stream.split("\n").filter(Boolean);

  return (
    <AgentReasoning
      status={complete ? "complete" : "thinking"}
      duration={STREAM_SECONDS}
      maxHeight={196}
    >
      {lines.map((line, index) => (
        <p
          // biome-ignore lint/suspicious/noArrayIndexKey: streamed lines are append-only and keep their position while text grows.
          key={index}
        >
          {line}
        </p>
      ))}
    </AgentReasoning>
  );
}

export function AgentReasoningPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[300px] w-full max-w-lg">
      <ReasoningDemo key={run} />

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
