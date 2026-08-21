import type { Metadata } from "next";
import { CopyPage } from "@/components/app/docs/copy-page";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { SITE_URL } from "@/lib/site";
import { MotionPatterns } from "./motion-patterns";

const PAGE_PATH = "/docs/motion-patterns";

const PAGE_NAV_ITEMS = [
  {
    id: "overview",
    label: "Motion guides",
    children: [
      { id: "decision-framework", label: "Decision framework" },
      { id: "motion-tokens", label: "Motion tokens" },
      { id: "timing", label: "Timing" },
      { id: "recipes", label: "Recipes" },
      { id: "accessibility", label: "Accessibility" },
    ],
  },
];

export const metadata: Metadata = {
  title: "Motion Guides",
  description:
    "Practical motion guidance for React interfaces: when to animate, which beUI token to use, timing ranges, reduced motion, and copy-ready patterns.",
  alternates: {
    canonical: PAGE_PATH,
    types: { "text/markdown": `${PAGE_PATH}.md` },
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
    <GuideShell navItems={PAGE_NAV_ITEMS}>
      <header
        id="overview"
        className="scroll-mt-24 border-b border-border pb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Motion guide
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            Motion that explains, not distracts
          </h1>
          <CopyPage
            pageUrl={`${SITE_URL}${PAGE_PATH}`}
            markdownPath={`${PAGE_PATH}.md`}
            componentName="Motion Guides"
          />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A practical guide to deciding when something should move, choosing
          the right token, and shipping motion that stays fast, coherent, and
          accessible.
        </p>
      </header>

      <MotionPatterns />
    </GuideShell>
  );
}
