"use client";

import { useRef } from "react";
import { FeedbackWidget } from "@/components/motion/feedback-widget";

export function FeedbackWidgetPreview() {
  const attempts = useRef(0);

  const submitFeedback = async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    attempts.current += 1;

    if (attempts.current === 1) {
      throw new Error("Preview submission failed");
    }
  };

  return (
    <div className="relative h-80 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background">
      {/* Faux app surface so the corner trigger has something to sit on. */}
      <div className="border-b border-border px-5 py-3">
        <div className="h-2.5 w-24 rounded-full bg-muted-foreground/20" />
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="h-2.5 w-3/4 rounded-full bg-muted-foreground/15" />
        <div className="h-2.5 w-1/2 rounded-full bg-muted-foreground/15" />
        <div className="h-24 w-full rounded-xl bg-muted-foreground/[0.06]" />
        <div className="h-2.5 w-2/3 rounded-full bg-muted-foreground/15" />
      </div>

      <FeedbackWidget onSubmit={submitFeedback} />
    </div>
  );
}
