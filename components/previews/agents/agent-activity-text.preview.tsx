"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  AgentActivity,
  type AgentActivityItem,
} from "@/components/agents/agent-activity";

const REASONING = [
  "Reading the request and separating the content model from its presentation.",
  "The activity shell can stay consistent while each event supplies its own compact renderer.",
  "Text remains freeform so partial tokens can update without recreating the surrounding timeline.",
  "As each sentence wraps, the measured stream moves upward through a single transform instead of repeatedly jumping the native scroll position.",
  "Older context stays available above the fold while the newest tokens remain crisp at the bottom edge.",
  "Once the run finishes, the viewport switches from automatic following to ordinary user-controlled scrolling.",
  "Opening the completed disclosure returns to the beginning so the reasoning can be read in order.",
  "The capped viewport follows the latest sentence and preserves the full log after completion.",
].join("\n");

const CHARACTERS_PER_SECOND = 90;
const STREAM_SECONDS = REASONING.length / CHARACTERS_PER_SECOND;

function StreamingTextDemo() {
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
      const cursor = Math.min(
        REASONING.length,
        Math.floor(((now - startedAt) / 1000) * CHARACTERS_PER_SECOND),
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

  const items: AgentActivityItem[] = stream
    .split("\n")
    .filter(Boolean)
    .map((content, index) => ({
      id: `reasoning-${index}`,
      type: "text",
      content,
    }));

  return (
    <AgentActivity
      items={items}
      contentType="text"
      status={complete ? "complete" : "working"}
      duration={STREAM_SECONDS}
      defaultOpen={reduce}
      collapseOnComplete={!reduce}
      maxHeight={180}
    />
  );
}

export function AgentActivityTextPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[330px] w-full max-w-lg">
      <StreamingTextDemo key={run} />
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
