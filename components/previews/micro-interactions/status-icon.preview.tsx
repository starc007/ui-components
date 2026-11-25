"use client";

import { useState } from "react";
import { StatusIcon, type StatusIconStatus } from "@/components/motion/status-icon";
import { useAutoplay } from "./autoplay";

// Every settled state is reached from a sync, as it would be in an app.
const SEQUENCE: { status: StatusIconStatus; text: string }[] = [
  { status: "syncing", text: "Syncing changes" },
  { status: "success", text: "All changes saved" },
  { status: "syncing", text: "Syncing changes" },
  { status: "warning", text: "2 files need review" },
  { status: "syncing", text: "Syncing changes" },
  { status: "error", text: "Could not reach the server" },
  { status: "idle", text: "Waiting for changes" },
];

export function StatusIconPreview() {
  const [step, setStep] = useState(0);
  const stage = useAutoplay(() => setStep((value) => (value + 1) % SEQUENCE.length), 1400);
  const { status, text } = SEQUENCE[step];

  return (
    <div {...stage}>
      <div className="flex items-center gap-2.5 rounded-full border border-border px-3.5 py-2 text-sm">
        <StatusIcon status={status} decorative />
        <span aria-live="polite" className="min-w-44 text-foreground">
          {text}
        </span>
      </div>
    </div>
  );
}
