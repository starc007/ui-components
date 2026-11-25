"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { ClipResizeFrame } from "@/components/agents/clip-resize-frame";
import { ActionSwapRollText } from "@/components/motion/action-swap-roll";
import { StatusIcon, type StatusIconStatus } from "@/components/motion/status-icon";
import { SPRING_MORPH } from "@/lib/ease";
import { useAutoplay } from "./autoplay";

// Every result is reached from a sync, as it would be in an app.
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
  const reduce = useReducedMotion() ?? false;
  // Long enough for a result to land and be read before the next sync.
  const stage = useAutoplay(() => setStep((value) => (value + 1) % SEQUENCE.length), 1900);
  const { status, text } = SEQUENCE[step];

  return (
    <div {...stage}>
      {/* The pill fits its text: as the status changes, both ends spring in or
          out from the centre, with a clip, so its width never animates. */}
      <ClipResizeFrame
        axis="x"
        radius={999}
        contentClassName="flex items-center gap-2.5 py-2 pr-4 pl-2.5 text-sm"
      >
        {/* Icon and text slide to their new places on the same spring as
            the ends, so they keep their distance from the edges instead of
            jumping when the text changes length. */}
        <motion.span
          layout={reduce ? false : "position"}
          transition={SPRING_MORPH}
          className="flex"
        >
          <StatusIcon status={status} decorative />
        </motion.span>
        <motion.span
          layout={reduce ? false : "position"}
          transition={SPRING_MORPH}
          aria-live="polite"
          className="text-foreground"
        >
          <ActionSwapRollText value={text}>{text}</ActionSwapRollText>
        </motion.span>
      </ClipResizeFrame>
    </div>
  );
}
