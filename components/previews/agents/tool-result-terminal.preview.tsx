"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import {
  ToolResult,
  ToolResultOutput,
} from "@/components/agents/tool-result";
import { useToolResultDemo } from "./use-tool-result-demo";

const OUTPUT = [
  "$ bun test tests/a11y.test.tsx",
  "bun test v1.3.14",
  "✓ StreamingResponse complete",
  "✓ ToolApproval pending",
  "✓ Citations expanded",
  "49 pass · 0 fail",
] as const;

function TerminalRun({ onReplay }: { onReplay: () => void }) {
  const { visible, status } = useToolResultDemo(OUTPUT.length);
  const output = OUTPUT.slice(0, visible).join("\n");

  return (
    <ToolResult
      tool="terminal.run"
      title={status === "running" ? "Running accessibility tests" : "Tests passed"}
      kind="terminal"
      status={status}
      meta={status === "success" ? "2.9s" : undefined}
      copyText={output}
      onRetry={onReplay}
      maxHeight={150}
    >
      <ToolResultOutput>{output}</ToolResultOutput>
    </ToolResult>
  );
}

export function ToolResultTerminalPreview() {
  const [run, setRun] = useState(0);
  const replay = () => setRun((value) => value + 1);

  return (
    <div className="relative h-[330px] w-full max-w-lg">
      <TerminalRun key={run} onReplay={replay} />
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
