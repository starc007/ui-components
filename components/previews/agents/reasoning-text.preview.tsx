"use client";

import {
  ReasoningText,
  type ReasoningTextVariant,
} from "@/components/agents/loading-states/reasoning-text";

const EXAMPLES: {
  label: string;
  variant: ReasoningTextVariant;
  phrases: string[];
}[] = [
  {
    label: "Cascade",
    variant: "cascade",
    phrases: [
      "Thinking",
      "Reading the request",
      "Working through the details",
      "Preparing the answer",
    ],
  },
  {
    label: "Swap",
    variant: "swap",
    phrases: [
      "Thinking",
      "Reading the request",
      "Working through the details",
      "Preparing the answer",
    ],
  },
  {
    label: "Scramble",
    variant: "scramble",
    phrases: ["Thinking", "Searching", "Reasoning", "Composing"],
  },
];

export function ReasoningTextPreview() {
  return (
    <div className="grid w-full max-w-sm gap-7">
      {EXAMPLES.map(({ label, variant, phrases }) => (
        <div key={variant} className="grid gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {label}
          </span>
          <ReasoningText
            variant={variant}
            phrases={phrases}
            className="text-base"
          />
        </div>
      ))}
    </div>
  );
}
