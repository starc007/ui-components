"use client";

import { Button } from "@/components/motion/button";
import { confetti } from "@/components/motion/confetti";

export function ConfettiUsage() {
  return (
    <Button onClick={(event) => confetti({ origin: event.currentTarget })}>
      Celebrate
    </Button>
  );
}
