"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NativeClip, NativeTheme } from "@/lib/native";
import { cn } from "@/lib/utils";

const control =
  "inline-flex size-9 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground backdrop-blur outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

/**
 * A component's looping recording from the iOS Simulator, in the site's
 * theme. The clip plays only while on screen; with reduced motion it waits for
 * the play button.
 */
export function NativePreview({
  clips,
  title,
}: {
  clips: Record<NativeTheme, NativeClip | null>;
  title: string;
}) {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // A reader's pause outranks scrolling back into view.
  const pausedByReader = useRef(false);
  useEffect(() => setMounted(true), []);

  const theme: NativeTheme = resolvedTheme === "light" ? "light" : "dark";
  const clip = clips[theme] ?? clips.light ?? clips.dark;

  // A parent can remount the video (switching platforms does), so observe
  // whichever element is attached rather than the first one.
  const attach = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video;
      if (!video || reduce) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            // Browsers can refuse autoplay, as in Low Power Mode; the poster
            // stays up and the play button still works.
            if (!pausedByReader.current) video.play().catch(() => {});
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

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      pausedByReader.current = false;
      video.play().catch(() => {});
    } else {
      pausedByReader.current = true;
      video.pause();
    }
  };

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;
    pausedByReader.current = false;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  if (!clip) return null;

  const frame =
    "relative aspect-[1206/2622] h-full overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm";

  return (
    <div>
      <div className="relative flex h-[34rem] items-center justify-center overflow-hidden rounded-2xl border border-border bg-card py-8 sm:h-[40rem] sm:py-10">
        <div className={frame}>
          {mounted ? (
            <video
              key={clip.video}
              ref={attach}
              src={clip.video}
              poster={clip.poster}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`${title} running on iOS`}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            // Before hydration the theme is unknown; CSS picks the poster.
            (["light", "dark"] as const).map((name) =>
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
            )
          )}
        </div>

        {mounted ? (
          <div className="absolute right-4 bottom-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className={control}
            >
              {playing ? (
                <Pause aria-hidden="true" className="size-4" />
              ) : (
                <Play aria-hidden="true" className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={replay}
              aria-label="Replay"
              className={control}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
