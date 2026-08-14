"use client";

import { useReducedMotion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

const DEFAULT_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/";

export interface TextScrambleProps {
  /** Final text revealed by the scramble animation. */
  text: string;
  /** Maximum animation duration in milliseconds. */
  duration?: number;
  /** Characters sampled while unresolved positions are scrambling. */
  glyphs?: string;
  className?: string;
  style?: CSSProperties;
}

/** Character scramble that resolves to `text` and respects reduced motion. */
export function TextScramble({
  text,
  duration,
  glyphs = DEFAULT_GLYPHS,
  className,
  style,
}: TextScrambleProps) {
  const reduce = useReducedMotion() ?? false;
  const [display, setDisplay] = useState(text);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setDisplay(text);
      return;
    }

    if (reduce || !glyphs) {
      setDisplay(text);
      return;
    }

    const characters = text.split("");
    const startedAt = performance.now();
    const animationDuration = duration
      ?? Math.min(760, Math.max(420, characters.length * 32));
    let frame = 0;
    let lastUpdate = 0;

    const animate = (now: number) => {
      if (now - lastUpdate >= 40) {
        lastUpdate = now;
        const progress = Math.min((now - startedAt) / animationDuration, 1);
        const settled = Math.floor(progress * characters.length);
        setDisplay(characters.map((character, index) => {
          if (index < settled || character === " ") return character;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join(""));
      }

      if (now - startedAt < animationDuration) {
        frame = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, glyphs, reduce, text]);

  return (
    <span className={cn("inline-block whitespace-pre", className)} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{reduce ? text : display}</span>
    </span>
  );
}
