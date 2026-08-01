"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { StreamingResponse } from "@/components/agents/streaming-response";

const RESPONSE =
  "The activity stream can stay focused on what the agent is doing, while the response surface handles the final answer. Keeping those responsibilities separate prevents incoming tokens from remounting controls or shifting completed content.\n\nFor implementation, preserve each rendered block, append only new text, and reveal response actions after the stream closes. This keeps copying, retrying, and feedback available without competing with the answer while it is still being written.";

const CHARACTERS_PER_SECOND = 110;

function ResponseDemo({ onReplay }: { onReplay: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const [content, setContent] = useState(reduce ? RESPONSE : "");
  const [complete, setComplete] = useState(reduce);

  useEffect(() => {
    if (reduce) return;

    const startedAt = performance.now();
    let frame = 0;
    let completionTimer: number | undefined;
    const stream = (now: number) => {
      const cursor = Math.min(
        RESPONSE.length,
        Math.floor(((now - startedAt) / 1000) * CHARACTERS_PER_SECOND),
      );
      setContent(RESPONSE.slice(0, cursor));
      if (cursor < RESPONSE.length) frame = requestAnimationFrame(stream);
      else completionTimer = window.setTimeout(() => setComplete(true), 450);
    };

    frame = requestAnimationFrame(stream);
    return () => {
      cancelAnimationFrame(frame);
      if (completionTimer) window.clearTimeout(completionTimer);
    };
  }, [reduce]);

  return (
    <StreamingResponse
      status={complete ? "complete" : "streaming"}
      copyText={RESPONSE}
      onRetry={onReplay}
      contentClassName="whitespace-pre-wrap"
    >
      {content}
    </StreamingResponse>
  );
}

export function StreamingResponsePreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[360px] w-full max-w-xl">
      <ResponseDemo key={run} onReplay={() => setRun((value) => value + 1)} />
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
