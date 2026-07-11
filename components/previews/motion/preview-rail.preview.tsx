"use client";

import { PreviewRail } from "@/components/motion/preview-rail";

export const previewRailItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Return to your workspace overview and recent activity.",
    href: "#dashboard",
  },
  {
    id: "components",
    label: "Components",
    description: "Browse motion primitives for React and Next.js.",
    href: "#components",
  },
  {
    id: "blocks",
    label: "Blocks",
    description: "Explore composed, product-ready interface blocks.",
    href: "#blocks",
  },
  {
    id: "playground",
    label: "Playground",
    description: "Tune motion values and preview behavior live.",
    href: "#playground",
  },
  {
    id: "docs",
    label: "Documentation",
    description: "Read installation, usage, and API reference notes.",
    href: "#docs",
  },
  {
    id: "changelog",
    label: "Changelog",
    description: "Review newly launched components and improvements.",
    href: "#changelog",
  },
  {
    id: "sponsors",
    label: "Sponsors",
    description: "Support continued development of the open-source library.",
    href: "#sponsors",
  },
  {
    id: "pro",
    label: "beUI Pro",
    description: "Get premium components and lifetime access.",
    href: "#pro",
  },
  {
    id: "examples",
    label: "Examples",
    description: "See components composed in practical interface patterns.",
    href: "#examples",
  },
  {
    id: "templates",
    label: "Templates",
    description: "Start from polished layouts built with beUI components.",
    href: "#templates",
  },
  {
    id: "guides",
    label: "Guides",
    description: "Learn how to combine motion primitives effectively.",
    href: "#guides",
  },
  {
    id: "community",
    label: "Community",
    description: "Discover what other builders are creating with beUI.",
    href: "#community",
  },
  {
    id: "github",
    label: "GitHub",
    description: "View the source, report issues, and contribute improvements.",
    href: "#github",
  },
  {
    id: "about",
    label: "About",
    description: "Learn more about the ideas and people behind beUI.",
    href: "#about",
  },
];

export function PreviewRailPreview() {
  return (
    <div className="flex w-full flex-col gap-8">
      <PreviewRail
        items={previewRailItems}
        defaultActiveId="docs"
        className="mx-auto h-[360px] w-full max-w-2xl"
      />
      <PreviewRail
        items={previewRailItems}
        orientation="horizontal"
        defaultActiveId="docs"
        className="mx-auto h-[280px] w-full max-w-2xl"
      />
    </div>
  );
}
