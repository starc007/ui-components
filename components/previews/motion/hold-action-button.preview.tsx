"use client";

import { useState } from "react";
import { HoldActionButton } from "@/components/motion/hold-action-button";

export function HoldActionButtonPreview() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <HoldActionButton
        onHoldComplete={() => {
          setConfirmed(true);
          window.setTimeout(() => setConfirmed(false), 1800);
        }}
      >
        Hold to confirm
      </HoldActionButton>
      <p className="h-4 text-xs text-muted-foreground" aria-live="polite">
        {confirmed ? "Action confirmed" : "Release early to cancel"}
      </p>
    </div>
  );
}
