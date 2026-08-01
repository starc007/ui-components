"use client";

import { BookOpen, Code2, RotateCcw, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  SourceCitation,
  Sources,
  type SourceItem,
} from "@/components/agents/sources";

const SOURCE_ITEMS: SourceItem[] = [
  {
    id: "motion",
    title: "Motion documentation",
    domain: "motion.dev",
    description: "Layout animation and reduced-motion guidance for React interfaces.",
    url: "https://motion.dev/docs/react",
    icon: <Code2 className="size-3.5" />,
  },
  {
    id: "wai",
    title: "WAI accessibility patterns",
    domain: "w3.org",
    description: "Keyboard and disclosure behavior for accessible interactive content.",
    url: "https://www.w3.org/WAI/ARIA/apg/",
    icon: <ShieldCheck className="size-3.5" />,
  },
  {
    id: "react",
    title: "React documentation",
    domain: "react.dev",
    description: "Rendering and state patterns for progressively updated interfaces.",
    url: "https://react.dev/learn",
    icon: <BookOpen className="size-3.5" />,
  },
];

function SourcesDemo() {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(reduce ? SOURCE_ITEMS.length : 0);

  useEffect(() => {
    if (reduce) return;
    const timers = SOURCE_ITEMS.map((_, index) =>
      window.setTimeout(() => setVisible(index + 1), 500 + index * 700),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-foreground/90">
        Use layout-aware motion for newly appended results
        <SourceCitation sourceId="motion" index={1} /> and preserve accessible
        disclosure behavior
        <SourceCitation sourceId="wai" index={2} /> as the list grows.
      </p>
      <Sources sources={SOURCE_ITEMS.slice(0, visible)} defaultOpen />
    </div>
  );
}

export function SourcesPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[360px] w-full max-w-lg">
      <SourcesDemo key={run} />
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
