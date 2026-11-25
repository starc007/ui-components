"use client";

import { useState } from "react";
import { WaveReveal } from "@/components/motion/wave-reveal";

export function WaveRevealUsage() {
  const [sent, setSent] = useState(false);

  return (
    // The wave leaves from wherever the button was pressed.
    <WaveReveal
      revealed={sent}
      className="w-72 rounded-2xl border border-border"
      revealedContent={
        <div className="flex flex-col gap-3 p-5">
          <p className="text-sm font-medium">Invite sent</p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="h-10 rounded-full border border-border text-sm"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 p-5">
        <p className="text-sm font-medium">Invite your team</p>
        <button
          type="button"
          onClick={() => setSent(true)}
          className="h-10 rounded-full bg-primary text-sm text-primary-foreground"
        >
          Send invite
        </button>
      </div>
    </WaveReveal>
  );
}
