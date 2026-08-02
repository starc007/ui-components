"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Citation,
  Citations,
  type CitationItem,
} from "@/components/agents/citations";

const CITATION_ITEMS: CitationItem[] = [
  {
    id: "motion",
    title: "Motion documentation",
    domain: "motion.dev",
    url: "https://motion.dev/docs/react",
  },
  {
    id: "wai",
    title: "WAI accessibility patterns",
    domain: "w3.org",
    url: "https://www.w3.org/WAI/ARIA/apg/",
  },
  {
    id: "react",
    title: "React documentation",
    domain: "react.dev",
    url: "https://react.dev/learn",
  },
];

function CitationsDemo() {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(reduce ? CITATION_ITEMS.length : 0);

  useEffect(() => {
    if (reduce) return;
    const timers = CITATION_ITEMS.map((_, index) =>
      window.setTimeout(() => setVisible(index + 1), 500 + index * 700),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-foreground/90">
        Use layout-aware motion for newly appended results{" "}
        <Citation citationId="motion" index={1} idPrefix="preview-source" /> and preserve accessible
        disclosure behavior <Citation citationId="wai" index={2} idPrefix="preview-source" /> as the list
        grows.
      </p>
      <Citations
        idPrefix="preview-source"
        citations={CITATION_ITEMS.slice(0, visible)}
        defaultOpen
      />
    </div>
  );
}

export function CitationsPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[410px] w-full max-w-lg">
      <CitationsDemo key={run} />
      <button
        type="button"
        onClick={() => setRun((value) => value + 1)}
        className="absolute bottom-0 left-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
