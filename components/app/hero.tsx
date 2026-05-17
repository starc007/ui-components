"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { GithubIcon } from "@/components/app/icons";
import { Magnetic } from "@/components/motion/magnetic";

const SPRING = {
  type: "spring" as const,
  stiffness: 140,
  damping: 26,
  mass: 1.2,
};
const STAGGER = 0.09;

function splitWords(text: string) {
  return text.split(" ");
}

function Line({ text, startDelay }: { text: string; startDelay: number }) {
  const words = splitWords(text);
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ y: "40%", opacity: 0, filter: "blur(12px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{
            y: { ...SPRING, delay: startDelay + i * STAGGER },
            opacity: {
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: startDelay + i * STAGGER,
            },
            filter: {
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
              delay: startDelay + i * STAGGER,
            },
          }}
          className="inline-block will-change-transform"
        >
          {word}
          {i < words.length - 1 ? (
            <span className="inline-block">&nbsp;</span>
          ) : null}
        </motion.span>
      ))}
    </span>
  );
}

const HEADLINE = ["Motion components", "that don't suck."];

export function Hero() {
  const subDelay = 0.12 + HEADLINE.length * 0.25 + 0.2;
  const ctaDelay = subDelay + 0.25;

  return (
    <div className="mx-auto max-w-5xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="https://github.com/starc007/ui-components"
          target="_blank"
          rel="noreferrer noopener"
          className="group mb-7 inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 py-1 text-xs font-medium text-(--color-fg) press"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-(--color-fg)" />
          v2 is live. Built on Tailwind 4, React 19
          <ArrowUpRight className="h-3 w-3 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </motion.div>

      <h1 className="text-balance text-[2.75rem] font-semibold leading-[0.95] tracking-[-0.045em] text-(--color-fg) sm:text-6xl md:text-6xl lg:text-[4.5rem]">
        {HEADLINE.map((line, i) => (
          <span key={line} className="block py-[0.02em]">
            <Line text={line} startDelay={0.12 + i * 0.2} />
          </span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
          delay: subDelay,
        }}
        className="mx-auto mt-7 max-w-2xl text-pretty text-base text-(--color-fg-muted) md:text-lg"
      >
        Interactions worth shipping.{" "}
        <span className="text-(--color-fg)">
          No Radix, no shadcn. Just motion.
        </span>{" "}
        Copy, paste, done.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
          delay: ctaDelay,
        }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <Magnetic strength={0.2}>
          <Link
            href="/components/motion"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-(--color-fg) px-6 text-sm font-medium text-(--color-bg) press"
          >
            Browse components
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Magnetic>
        <Link
          href="https://github.com/starc007/ui-components"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-6 text-sm font-medium text-(--color-fg) press hover:border-(--color-border-strong)"
        >
          <GithubIcon className="h-4 w-4" />
          Star on GitHub
        </Link>
      </motion.div>
    </div>
  );
}
