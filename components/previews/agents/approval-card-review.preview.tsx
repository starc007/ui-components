"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ApprovalCard,
  type ApprovalCardStatus,
} from "@/components/agents/approval-card";

function ReviewFlow() {
  const [status, setStatus] = useState<ApprovalCardStatus>("pending");
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const finish = (next: ApprovalCardStatus) => {
    setStatus("submitting");
    timer.current = window.setTimeout(() => setStatus(next), 700);
  };

  return (
    <ApprovalCard
      title="Publish the component update?"
      description="The agent has prepared the release and is waiting for your decision."
      status={status}
      onApprove={() => finish("approved")}
      onRequestChanges={() => finish("changes-requested")}
      onReject={() => finish("rejected")}
      result={
        status === "approved"
          ? "Publishing was approved."
          : status === "changes-requested"
            ? "The agent will wait for revision notes."
            : "Publishing was declined."
      }
    >
      <dl className="grid gap-1 text-xs">
        <div className="flex items-center justify-between gap-4 py-1">
          <dt className="text-muted-foreground">Release</dt>
          <dd className="font-mono text-foreground/80">approval-card</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-1">
          <dt className="text-muted-foreground">Checks</dt>
          <dd className="text-foreground/80">4 passed</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-1">
          <dt className="text-muted-foreground">Visibility</dt>
          <dd className="text-foreground/80">Public registry</dd>
        </div>
      </dl>
    </ApprovalCard>
  );
}

export function ApprovalCardReviewPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[360px] w-full max-w-lg">
      <ReviewFlow key={run} />
      <button
        type="button"
        onClick={() => setRun((value) => value + 1)}
        className="absolute bottom-0 left-0 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
