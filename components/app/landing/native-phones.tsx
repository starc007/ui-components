"use client";

import { ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { NativeClip, NativeTheme } from "@/lib/native";
import { cn } from "@/lib/utils";

export type NativePhone = {
  slug: string;
  title: string;
  href: string;
  clips: Record<NativeTheme, NativeClip | null>;
};

/**
 * Phones looping recorded clips of native components. Each plays only while
 * on screen, and one control pauses them all. With reduced motion they start
 * paused on their posters.
 */
export function NativePhones({ phones }: { phones: NativePhone[] }) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  // Reduced motion starts paused; the control can still play them.
  useEffect(() => {
    if (reduce) setPaused(true);
  }, [reduce]);

  return (
    <div className="relative mt-12 sm:mt-14">
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        className="absolute top-0 right-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 text-xs font-medium text-muted-foreground outline-none backdrop-blur transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {paused ? (
          <Play aria-hidden="true" className="size-3.5" />
        ) : (
          <Pause aria-hidden="true" className="size-3.5" />
        )}
        {paused ? "Play clips" : "Pause clips"}
      </button>
      {/* The phones rise out of the panel's bottom edge, staggered. */}
      <ul className="flex h-[17rem] items-start justify-center gap-3 overflow-hidden px-4 pt-12 [mask-image:linear-gradient(to_bottom,black_85%,transparent)] sm:h-[22rem] sm:gap-5 lg:h-[26rem] lg:gap-8">
        {phones.map((phone, index) => (
          <li
            key={phone.slug}
            className={cn(
              "flex-none",
              STAGGER[index % STAGGER.length],
              // Two phones fit a narrow screen, three a tablet.
              index === 2 && "hidden md:block",
              index >= 3 && "hidden lg:block",
            )}
          >
            <Link
              href={phone.href}
              className="group flex flex-col items-center gap-3 outline-none"
            >
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors group-hover:border-(--color-border-strong)">
                {phone.title}
                <ArrowRight
                  aria-hidden="true"
                  className="size-3 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </span>
              <PhoneClip phone={phone} paused={paused} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Vertical offsets that keep the row from reading as a flat grid.
const STAGGER = ["mt-10", "mt-0", "mt-4", "mt-12"];

function PhoneClip({ phone, paused }: { phone: NativePhone; paused: boolean }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => setMounted(true), []);

  const theme: NativeTheme = resolvedTheme === "light" ? "light" : "dark";
  const clip = phone.clips[theme] ?? phone.clips.light ?? phone.clips.dark;

  const attach = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Play only while on screen and not paused. Browsers can refuse autoplay,
  // as in Low Power Mode; the poster stays up then.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a theme change swaps the clip and its video element, which then needs playing too.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !paused) video.play().catch(() => {});
    else video.pause();
  }, [visible, paused, clip?.video]);

  // A device: a dark bezel around the screen, lifted on hover.
  const device =
    "rounded-[2.4rem] bg-neutral-900 p-[6px] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.45)] ring-1 ring-black/5 transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-focus-visible:ring-2 group-focus-visible:ring-ring motion-reduce:transition-none dark:bg-neutral-800 dark:ring-white/20";
  const screen =
    "relative aspect-[1206/2622] h-[18rem] overflow-hidden rounded-[2.05rem] bg-background sm:h-[26rem] lg:h-[30rem]";

  if (!clip) {
    return (
      <div className={device}>
        <div className={screen} />
      </div>
    );
  }

  return (
    <div className={device}>
      <div className={screen}>
      {mounted ? (
        <video
          key={clip.video}
          ref={attach}
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
          phone.clips[name] ? (
            // biome-ignore lint/performance/noImgElement: static poster frame, sized by its container
            <img
              key={name}
              src={phone.clips[name].poster}
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
    </div>
  );
}
