"use client";

import { useState } from "react";
import { SlideActionButton } from "@/components/motion/slide-action-button";

export function SlideActionButtonPreview() {
  const [continued, setContinued] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <SlideActionButton
        completeLabel="Ready"
        onComplete={() => {
          setContinued(true);
          window.setTimeout(() => setContinued(false), 1800);
        }}
      >
        Slide to continue
      </SlideActionButton>
      <p className="h-4 text-xs text-muted-foreground" aria-live="polite">
        {continued ? "Action completed" : "Drag the arrow to the end"}
      </p>
    </div>
  );
}
