"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolApproval,
  ToolApprovalCode,
  type ToolApprovalStatus,
} from "@/components/agents/tool-approval";

export function ToolApprovalPreview() {
  const [status, setStatus] = useState<ToolApprovalStatus>("pending");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const finish = (next: ToolApprovalStatus) => {
    clearTimers();
    setStatus(next);
  };

  const approve = () => {
    clearTimers();
    setStatus("approving");
    timers.current = [
      window.setTimeout(() => setStatus("approved"), 600),
      window.setTimeout(() => setStatus("running"), 1150),
      window.setTimeout(() => setStatus("complete"), 2200),
    ];
  };

  const replay = () => {
    clearTimers();
    setStatus("pending");
    setDetailsOpen(true);
  };

  return (
    <div className="relative h-[360px] w-full max-w-lg">
      <ToolApproval
        tool="terminal.run"
        title={status === "pending" ? "Allow this tool to run?" : "Terminal access"}
        description="The agent wants to run the project test suite in the current workspace."
        status={status}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        parameters={[
          {
            id: "command",
            label: "Command",
            value: (
              <ToolApprovalCode
                code="bun test tests/a11y.test.tsx"
                language="bash"
              />
            ),
          },
          { id: "directory", label: "Directory", value: "ui-components" },
        ]}
        onApprove={approve}
        onAlwaysAllow={approve}
        onDeny={() => finish("denied")}
      />
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
