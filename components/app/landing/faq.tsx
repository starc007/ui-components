import Link from "next/link";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";

const FAQS = [
  {
    id: "free",
    title: "Is beUI free for commercial projects?",
    description: (
      <>
        Yes. The public beUI library is MIT licensed, including commercial use
        and modification. Keep the copyright and license notice in copies or
        substantial portions of the source.{" "}
        <a
          className="underline underline-offset-4"
          href="https://github.com/starc007/ui-components/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer noopener"
        >
          Read the license
        </a>
        . beUI Pro has a separate paid license.
      </>
    ),
  },
  {
    id: "install",
    title: "How do I install a component?",
    description: (
      <>
        Open a component page and copy its shadcn CLI command, such as{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          bunx --bun shadcn add @beui/button
        </code>
        . You can also use npm, pnpm, or yarn, or copy the source from the
        Manual tab.
      </>
    ),
  },
  {
    id: "stack",
    title: "What does my project need?",
    description: (
      <>
        The components are built for React 19, Tailwind CSS 4, and Motion.
        Individual components may use additional dependencies listed on their
        pages. Start with the{" "}
        <Link className="underline underline-offset-4" href="/docs/theme">
          theme setup guide
        </Link>{" "}
        to add the shared CSS tokens.
      </>
    ),
  },
  {
    id: "customize",
    title: "Can I change the design and animations?",
    description:
      "Yes. The source lives in your project. You can change the styles, motion, and behavior directly, and use your own theme tokens to match your product.",
  },
  {
    id: "pro",
    title: "Do I need Pro to use the free components?",
    description:
      "No. The public library works independently of Pro. Pro is a separate collection of premium components and animated blocks; the Lifetime plan also includes full templates and animated illustrations.",
  },
];

export function LandingFaq() {
  return (
    <section
      aria-labelledby="landing-faq"
      className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:pt-28"
    >
      <div className="mb-10 text-center">
        <p className="text-sm text-muted-foreground">FAQ</p>
        <h2
          id="landing-faq"
          className="mt-4 font-display text-3xl font-medium tracking-tight md:text-4xl"
        >
          A few things to know
        </h2>
      </div>
      <BouncyAccordion items={FAQS} className="w-full" />
    </section>
  );
}
