"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  AgentActivity,
  type AgentSearchResult,
} from "@/components/agents/agent-activity";

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="currentColor"
    >
      <path d="M21.35 12.23c0-.65-.06-1.28-.17-1.89H12v3.79h5.25a4.5 4.5 0 0 1-1.95 2.87v2.46h3.16c1.85-1.71 2.89-4.22 2.89-7.23Z" />
      <path d="M12 21.75c2.64 0 4.86-.87 6.46-2.29L15.3 17c-.87.58-1.98.92-3.3.92a5.7 5.7 0 0 1-5.35-3.93H3.39v2.54A9.75 9.75 0 0 0 12 21.75Z" />
      <path d="M6.65 13.99A5.85 5.85 0 0 1 6.34 12c0-.69.12-1.36.31-1.99V7.47H3.39A9.76 9.76 0 0 0 2.25 12c0 1.63.39 3.18 1.14 4.53l3.26-2.54Z" />
      <path d="M12 6.08c1.44 0 2.73.49 3.75 1.47l2.78-2.78A9.34 9.34 0 0 0 12 2.25a9.75 9.75 0 0 0-8.61 5.22l3.26 2.54A5.7 5.7 0 0 1 12 6.08Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.82c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.77c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function WikipediaMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="currentColor"
    >
      <path d="M1.5 4h6v1.2H6l4.08 10.73 1.26-3.12L8.45 5.2H7.2V4h6v1.2h-1.47l1.66 4.57 1.82-4.57H13.8V4h4.9v1.2h-1.45l-3.19 7.92 1.08 2.81L19.48 5.2H18V4h4.5v1.2h-1.42L15.25 20h-1.2l-1.91-4.86L10.18 20H8.92L3.25 5.2H1.5V4Z" />
    </svg>
  );
}

function VercelMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="currentColor"
    >
      <path d="m12 3 10 18H2L12 3Z" />
    </svg>
  );
}

const SEARCH_RESULTS: AgentSearchResult[] = [
  {
    id: "google",
    title: "Google for Developers",
    domain: "developers.google.com",
    icon: <GoogleMark />,
  },
  {
    id: "github",
    title: "GitHub",
    domain: "github.com",
    icon: <GitHubMark />,
  },
  {
    id: "wikipedia",
    title: "Wikipedia",
    domain: "wikipedia.org",
    icon: <WikipediaMark />,
  },
  {
    id: "vercel",
    title: "Vercel Docs",
    domain: "vercel.com/docs",
    icon: <VercelMark />,
  },
];

function SearchDemo() {
  const reduce = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (reduce) {
      setVisible(SEARCH_RESULTS.length);
      setComplete(true);
      return;
    }

    const resultTimers = SEARCH_RESULTS.map((_, index) =>
      window.setTimeout(() => setVisible(index + 1), 650 + index * 650),
    );
    const completeTimer = window.setTimeout(() => setComplete(true), 3900);
    return () => {
      resultTimers.forEach(window.clearTimeout);
      window.clearTimeout(completeTimer);
    };
  }, [reduce]);

  return (
    <AgentActivity
      status={complete ? "complete" : "working"}
      contentType="search"
      defaultOpen={reduce}
      collapseOnComplete={!reduce}
      maxHeight={220}
      items={[
        {
          id: "search",
          type: "search",
          query: "accessible animation patterns for React",
          results: SEARCH_RESULTS.slice(0, visible),
          moreCount: visible === SEARCH_RESULTS.length ? 7 : undefined,
        },
      ]}
    />
  );
}

export function AgentActivitySearchPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[330px] w-full max-w-lg">
      <SearchDemo key={run} />
      <button
        type="button"
        onClick={() => setRun((current) => current + 1)}
        className="absolute bottom-0 left-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
