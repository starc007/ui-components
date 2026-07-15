import type { Metadata } from "next";
import { MotionPatterns } from "./motion-patterns";

export const metadata: Metadata = {
  title: "Motion Guides",
  description:
    "Practical motion guidance for React interfaces: when to animate, which beUI token to use, timing ranges, reduced motion, and copy-ready patterns.",
  alternates: {
    canonical: "/docs/motion-patterns",
  },
  openGraph: {
    title: "Motion Guides · beUI",
    description:
      "Practical guidance for purposeful animation, timing, easing, springs, and accessible motion in React interfaces.",
    url: "/docs/motion-patterns",
    type: "article",
    siteName: "beUI",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Motion Guides · beUI",
    images: ["/api/og"],
  },
};

export default function MotionPatternsPage() {
  return (
    <div className="w-full">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        beUI motion system
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Motion that explains, not distracts.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        A practical guide to deciding when something should move, choosing the
        right token, and shipping motion that stays fast, coherent, and
        accessible.
      </p>

      <MotionPatterns />
    </div>
  );
}
