import type { Metadata } from "next";
import { MotionPatterns } from "./motion-patterns";

export const metadata: Metadata = {
  title: "Motion Patterns",
  description:
    "The motion tokens and patterns behind beUI: easing, springs and timing used across every component.",
  alternates: {
    canonical: "/docs/motion-patterns",
  },
  openGraph: {
    title: "Motion Patterns · beUI",
    description:
      "The motion tokens and patterns behind beUI: easing, springs and timing used across every component.",
    url: "/docs/motion-patterns",
    type: "article",
    siteName: "beUI",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Motion Patterns · beUI",
    images: ["/api/og"],
  },
};

export default function MotionPatternsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-pixel text-4xl uppercase tracking-tight text-foreground">
        Motion Patterns
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Small cards for quick scanning. Open one to see the rule, example and what to avoid.
      </p>

      <MotionPatterns />
    </div>
  );
}
