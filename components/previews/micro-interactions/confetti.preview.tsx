"use client";

import { PartyPopper } from "lucide-react";
import { Button } from "@/components/motion/button";
import { confetti } from "@/components/motion/confetti";

export function ConfettiPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button onClick={(event) => confetti({ origin: event.currentTarget })}>
        <PartyPopper aria-hidden="true" className="size-4" />
        Celebrate
      </Button>
      <Button
        variant="secondary"
        onClick={(event) => confetti({ origin: event.currentTarget, count: 30, power: 0.6 })}
      >
        Small pop
      </Button>
    </div>
  );
}
