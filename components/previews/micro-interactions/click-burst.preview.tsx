"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { ClickBurst } from "@/components/motion/click-burst";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

// The fill swells out from the centre; the check draws in as it lands.
const FILL = { duration: 0.24, ease: EASE_OUT } as const;
const CHECK_IN = { duration: 0.26, ease: EASE_OUT, delay: 0.08 } as const;
const OUT = { duration: 0.14, ease: EASE_OUT } as const;

export function ClickBurstPreview() {
  const reduce = useReducedMotion() ?? false;
  const [done, setDone] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Bursts when it is ticked, not when it is unticked. */}
      <ClickBurst enabled={!done} origin="center" count={14} spread={44}>
        <motion.button
          type="button"
          aria-pressed={done}
          aria-label="Done"
          onClick={() => setDone((value) => !value)}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          transition={SPRING_PRESS}
          className={cn(
            "relative grid size-14 place-items-center rounded-full border outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            done ? "border-emerald-500" : "border-border hover:border-(--color-border-strong)",
          )}
        >
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={reduce ? { opacity: done ? 1 : 0 } : { opacity: done ? 1 : 0, scale: done ? 1 : 0.5 }}
            transition={done ? FILL : OUT}
            className="absolute inset-0 rounded-full bg-emerald-500"
          />
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="relative size-6">
            {/* A new key on each tick, so the white check draws in fresh;
                unticked it rests as a muted check. */}
            <motion.path
              key={done ? "done" : "idle"}
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke={done ? "white" : "currentColor"}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={done ? undefined : "text-muted-foreground"}
              initial={done && !reduce ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={CHECK_IN}
            />
          </svg>
        </motion.button>
      </ClickBurst>
      <p className="text-xs text-muted-foreground">{done ? "Click to undo" : "Click to tick"}</p>
    </div>
  );
}
