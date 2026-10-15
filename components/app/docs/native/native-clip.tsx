"use client";

import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import type { NativeClip as Clip, NativeTheme } from "@/lib/native";
import { cn } from "@/lib/utils";

/**
 * A component's looping screen recording from the iOS Simulator, in the
 * site's current theme. It plays only while on screen. With reduced motion it
 * waits on its first frame and shows controls instead of autoplaying.
 */
export function NativeClip({
  clips,
  title,
  className,
}: {
  clips: Record<NativeTheme, Clip | null>;
  title: string;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const theme: NativeTheme = resolvedTheme === "light" ? "light" : "dark";
  const clip = clips[theme] ?? clips.light ?? clips.dark;

  // A parent can remount the video (the platform tabs do when they switch),
  // so observe whichever element is attached rather than the first one.
  const observe = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video || reduce) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            // Browsers can refuse autoplay, as in Low Power Mode; the poster
            // frame stays up instead.
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(video);
      return () => observer.disconnect();
    },
    [reduce],
  );

  const frame = cn(
    "relative aspect-[1206/2622] w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm",
    className,
  );

  if (!clip) return null;

  // Before hydration the theme is unknown; CSS picks the matching poster.
  if (!mounted) {
    return (
      <div className={frame}>
        {(["light", "dark"] as const).map((name) =>
          clips[name] ? (
            // biome-ignore lint/performance/noImgElement: static poster frame, sized by its container
            <img
              key={name}
              src={clips[name].poster}
              alt=""
              className={cn(
                "absolute inset-0 h-full w-full object-cover",
                name === "light" ? "dark:hidden" : "hidden dark:block",
              )}
            />
          ) : null,
        )}
      </div>
    );
  }

  return (
    <div className={frame}>
      <video
        key={clip.video}
        ref={observe}
        src={clip.video}
        poster={clip.poster}
        muted
        loop
        playsInline
        preload="metadata"
        controls={Boolean(reduce)}
        aria-label={`${title} running on iOS`}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
