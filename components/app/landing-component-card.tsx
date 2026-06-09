"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { ComponentEntry } from "@/lib/registry";
import { getPreview } from "@/components/previews";

export function LandingComponentCard({ component }: { component: ComponentEntry }) {
  const Preview = getPreview("motion", component.slug);

  return (
    <article className="group/card relative min-h-[318px]">
      <Link
        href={`/components/motion/${component.slug}`}
        aria-label={`View ${component.name}`}
        className="absolute inset-0 z-20 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
      />
      <motion.div
        initial={false}
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.7 }}
        className="flex min-h-[318px] flex-col overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-elev) transition-colors duration-200 will-change-transform [contain:paint] group-hover/card:border-(--color-border-strong) group-focus-within/card:-translate-y-2 group-focus-within/card:border-(--color-border-strong)"
      >
        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-(--color-bg) px-5 py-6 [contain:paint] mask-b-fade">
          <div className="pointer-events-none flex w-full max-w-full origin-center scale-75 items-center justify-center overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [contain:paint] group-hover/card:scale-[0.78] group-focus-within/card:scale-[0.78] [&_*]:!cursor-default">
            {Preview ? <Preview /> : null}
          </div>
        </div>
        <div className="flex flex-1 items-start justify-between gap-3 border-t border-(--color-border) p-4">
          <div className="min-w-0">
            <h3 className="font-pixel text-base font-medium text-(--color-fg)">
              {component.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-(--color-fg-muted)">
              {component.description}
            </p>
          </div>
          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-fg-muted) transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 group-focus-within/card:translate-x-0.5 group-focus-within/card:-translate-y-0.5" />
        </div>
      </motion.div>
    </article>
  );
}
