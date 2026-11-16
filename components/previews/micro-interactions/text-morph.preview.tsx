"use client";

import { useEffect, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { cn } from "@/lib/utils";

const LABELS = { idle: "Subscribe", busy: "Subscribing", done: "Subscribed" } as const;
type State = keyof typeof LABELS;

export function TextMorphPreview() {
  const [state, setState] = useState<State>("idle");

  // Stand-in for a request: busy for a moment, then done.
  useEffect(() => {
    if (state !== "busy") return;
    const id = setTimeout(() => setState("done"), 1200);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <button
      type="button"
      aria-busy={state === "busy" || undefined}
      onClick={() => setState(state === "idle" ? "busy" : "idle")}
      className={cn(
        "inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        state === "done"
          ? "border border-border bg-transparent text-foreground"
          : "border border-primary bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      <TextMorph>{LABELS[state]}</TextMorph>
    </button>
  );
}
