"use client";

import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";
import {
  NOT_FOUND_DEFAULTS,
  NotFoundActions,
  type NotFoundProps,
  NotFoundStage,
  useNotFoundMessages,
} from "./shared";

export function NotFoundMagnetic({
  className,
  code = NOT_FOUND_DEFAULTS.code,
  title,
  description,
  homeHref,
  homeLabel,
  browseHref,
  browseLabel,
  labels,
}: NotFoundProps) {
  const t = useNotFoundMessages(labels);
  const chars = code.split("");

  return (
    <NotFoundStage className={className}>
      <h1
        aria-label={code}
        className="flex select-none items-center justify-center font-bold leading-none tracking-tighter text-foreground [font-size:clamp(5rem,18vw,12rem)]"
      >
        {chars.map((ch, i) => (
          <Magnetic
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional glyphs
            key={i}
            strength={0.6}
            className={cn(i > 0 && "-ml-2")}
          >
            <span aria-hidden className="inline-block px-1 tabular-nums">
              {ch}
            </span>
          </Magnetic>
        ))}
      </h1>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold text-foreground">{title ?? t("title")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description ?? t("description")}</p>
      </div>

      <NotFoundActions
        homeHref={homeHref}
        homeLabel={homeLabel}
        browseHref={browseHref}
        browseLabel={browseLabel}
        labels={labels}
      />
    </NotFoundStage>
  );
}
