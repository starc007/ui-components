"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentReasoning } from "@/components/agents/agent-reasoning";

const REASONING = [
  "Mapping the request into active, settled, and reopened states.",
  "Keeping the worklog visible while new details arrive.",
  "Tuning the transition to stay calm during longer tasks.",
  "Finishing with a compact summary that can be revisited.",
].join("\n");

const STREAM_CHUNK = 3;
const STREAM_INTERVAL = 32;
const STREAM_SECONDS =
  (Math.ceil(REASONING.length / STREAM_CHUNK) * STREAM_INTERVAL) / 1000;

function ReasoningDemo() {
  const [stream, setStream] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let cursor = 0;
    let completionTimer: number | undefined;

    const streamTimer = window.setInterval(() => {
      cursor = Math.min(cursor + STREAM_CHUNK, REASONING.length);
      setStream(REASONING.slice(0, cursor));

      if (cursor === REASONING.length) {
        window.clearInterval(streamTimer);
        completionTimer = window.setTimeout(() => setComplete(true), 500);
      }
    }, STREAM_INTERVAL);

    return () => {
      window.clearInterval(streamTimer);
      if (completionTimer) window.clearTimeout(completionTimer);
    };
  }, []);

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
          {!complete && index === lines.length - 1 ? (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-3 w-px animate-pulse bg-muted-foreground/60 align-[-1px] motion-reduce:animate-none"
            />
          ) : null}
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
