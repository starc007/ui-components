import type { Metadata } from "next";
import { MotionPatterns } from "./motion-patterns";

export const metadata: Metadata = {
  title: "Motion Patterns · beUI v2",
  description: "Simple motion patterns used across beUI components.",
  alternates: {
    canonical: "/docs/motion-patterns",
  },
};

export default function MotionPatternsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-pixel text-4xl uppercase tracking-tight text-(--color-fg)">
        Motion Patterns
      </h1>
      <p className="mt-3 max-w-2xl text-(--color-fg-muted)">
        Small cards for quick scanning. Open one to see the rule, example and what to avoid.
      </p>

      <MotionPatterns />
    </div>
  );
}
