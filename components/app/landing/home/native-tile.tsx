"use client";

import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { NewBadge } from "@/components/app/docs/new-badge";
import type { NativePhone } from "@/components/app/landing/native-phones";
import type { NativeTheme } from "@/lib/native";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type NativeTileComponent = NativePhone & { launchedAt?: string };

/**
 * Gallery tile for a React Native component, sized like `PreviewTile`. The
 * top of its recorded clip rises out of the frame; the clip plays on hover
 * and rests on its poster otherwise, and always with reduced motion.
 */
export function NativeTile({ component }: { component: NativeTileComponent }) {
  const t = useTranslations("Landing.card");
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => setMounted(true), []);

  const theme: NativeTheme = resolvedTheme === "light" ? "light" : "dark";
  const clip = component.clips[theme] ?? component.clips.light ?? component.clips.dark;

  // Browsers can refuse playback, as in Low Power Mode; the poster stays up then.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a theme change swaps the video element, which then needs the same state.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hover && !reduce) video.play().catch(() => {});
    else video.pause();
  }, [hover, reduce, clip?.video]);

  return (
    <article
      className="group/tile relative flex h-full min-h-0 flex-col"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <Link
        href={component.href}
        prefetch={false}
        aria-label={t("view", { name: component.title })}
        className="absolute inset-0 z-20 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border transition-colors duration-200 ease-out group-hover/tile:border-border-strong">
        <div className="relative m-2 mb-0 flex min-h-0 flex-1 justify-center overflow-hidden rounded-xl bg-card">
          <div className="relative mt-4 aspect-[1206/2622] w-32 shrink-0 self-start overflow-hidden rounded-[1.25rem] bg-neutral-900 p-[3px] dark:bg-neutral-800">
            <div className="relative h-full w-full overflow-hidden rounded-[1.1rem] bg-background">
              {mounted && clip ? (
                <video
                  key={clip.video}
                  ref={videoRef}
                  src={clip.video}
                  poster={clip.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden="true"
                  tabIndex={-1}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                // Before hydration the theme is unknown; CSS picks the poster.
                (["light", "dark"] as const).map((name) =>
                  component.clips[name] ? (
                    <img
                      key={name}
                      src={component.clips[name].poster}
                      alt=""
                      loading="lazy"
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover",
                        name === "light" ? "dark:hidden" : "hidden dark:block",
                      )}
                    />
                  ) : null,
                )
              )}
            </div>
          </div>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-between gap-2 px-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-[13px] font-medium text-foreground">{component.title}</h3>
            <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
              React Native
            </span>
            <NewBadge launchedAt={component.launchedAt} />
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 ease-out group-hover/tile:opacity-100"
          />
        </div>
      </div>
    </article>
  );
}
