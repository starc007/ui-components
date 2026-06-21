"use client";

import { TextReveal } from "@/components/motion/text-reveal";
import {
  NOT_FOUND_DEFAULTS,
  NotFoundActions,
  NotFoundStage,
  type NotFoundProps,
} from "./shared";

const TYPE_SPRING = { stiffness: 320, damping: 30, mass: 0.6 };

export function NotFoundTerminal({
  className,
  code = NOT_FOUND_DEFAULTS.code,
  title = NOT_FOUND_DEFAULTS.title,
  description = NOT_FOUND_DEFAULTS.description,
  homeHref,
  homeLabel,
  browseHref,
  browseLabel,
}: NotFoundProps) {
  return (
    <NotFoundStage className={className}>
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-neutral-950 text-left shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs text-white/40">~/beui</span>
        </div>
        <div className="space-y-1.5 p-4 font-mono text-sm leading-relaxed">
          <TextReveal
            as="p"
            split="char"
            stagger={0.018}
            blur={6}
            yOffset={0}
            spring={TYPE_SPRING}
            className="text-white/80"
            text="$ cd /page"
          />
          <TextReveal
            as="p"
            split="char"
            stagger={0.012}
            delay={0.45}
            blur={6}
            yOffset={0}
            spring={TYPE_SPRING}
            className="text-[#ff5f57]"
            text="cd: no such file or directory: /page"
          />
          <p className="flex items-center text-white/80">
            <TextReveal
              as="span"
              split="char"
              stagger={0.018}
              delay={1.1}
              blur={6}
              yOffset={0}
              spring={TYPE_SPRING}
              text={`$ status ${code}`}
            />
            <span className="ml-1 inline-block h-[1.1em] w-[0.55ch] translate-y-[0.12em] bg-white/80 motion-safe:animate-pulse" />
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>

      <NotFoundActions
        homeHref={homeHref}
        homeLabel={homeLabel}
        browseHref={browseHref}
        browseLabel={browseLabel}
      />
    </NotFoundStage>
  );
}
