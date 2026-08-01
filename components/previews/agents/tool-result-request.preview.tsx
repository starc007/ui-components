"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { AgentCode } from "@/components/agents/agent-code";
import {
  ToolResult,
  ToolResultOutput,
} from "@/components/agents/tool-result";
import { useToolResultDemo } from "./use-tool-result-demo";

const RESPONSE = `{
  "error": "rate_limit_exceeded",
  "retryAfter": 30,
  "requestId": "req_8f21"
}`;

function RequestRun({ onReplay }: { onReplay: () => void }) {
  const { visible, status } = useToolResultDemo(3, 600, "error");

  return (
    <ToolResult
      tool="http.request"
      title={status === "running" ? "Fetching project activity" : "Request failed"}
      kind="request"
      status={status}
      meta={status === "error" ? "429" : "GET /v1/activity"}
      copyText={RESPONSE}
      onRetry={onReplay}
      collapseOnComplete={false}
      maxHeight={150}
    >
      {visible < 3 ? (
        <ToolResultOutput>
          {visible === 0
            ? "Preparing request…"
            : visible === 1
              ? "GET /v1/activity\nConnecting…"
              : "GET /v1/activity\nWaiting for response…"}
        </ToolResultOutput>
      ) : (
        <AgentCode code={RESPONSE} language="json" />
      )}
    </ToolResult>
  );
}

export function ToolResultRequestPreview() {
  const [run, setRun] = useState(0);
  const replay = () => setRun((value) => value + 1);

  return (
    <div className="relative h-[330px] w-full max-w-lg">
      <RequestRun key={run} onReplay={replay} />
      <button
        type="button"
        onClick={replay}
        className="absolute bottom-0 left-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
