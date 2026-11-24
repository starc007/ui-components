"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import type { Sound } from "@/lib/sounds/engine";
import { cn } from "@/lib/utils";

const BARS = 32;
const SAMPLE_RATE = 22050;
const peaksCache = new WeakMap<Sound, number[]>();

/** Renders a sound offline and measures its loudness in `BARS` slices. */
async function measurePeaks(sound: Sound) {
  const cached = peaksCache.get(sound);
  if (cached) return cached;
  const length = Math.ceil(sound.duration * SAMPLE_RATE);
  const context = new OfflineAudioContext(1, length, SAMPLE_RATE);
  sound.render({ context, destination: context.destination, when: 0, volume: 1, pitch: 1 });
  const data = (await context.startRendering()).getChannelData(0);
  const size = Math.max(1, Math.floor(data.length / BARS));
  const peaks = Array.from({ length: BARS }, (_, bar) => {
    let peak = 0;
    for (let i = bar * size; i < Math.min(data.length, (bar + 1) * size); i++) {
      peak = Math.max(peak, Math.abs(data[i]));
    }
    return peak;
  });
  const max = Math.max(...peaks) || 1;
  const normalized = peaks.map((peak) => peak / max);
  peaksCache.set(sound, normalized);
  return normalized;
}

function usePeaks(sound: Sound) {
  const [peaks, setPeaks] = useState<number[] | null>(() => peaksCache.get(sound) ?? null);
  useEffect(() => {
    if (typeof OfflineAudioContext === "undefined") return;
    let live = true;
    measurePeaks(sound)
      .then((next) => live && setPeaks(next))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [sound]);
  return peaks;
}

function Bars({ peaks, className }: { peaks: number[] | null; className: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 flex items-center gap-[3px]">
      {Array.from({ length: BARS }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length bars.
          key={i}
          className={cn("min-h-[3px] flex-1 rounded-full", className)}
          style={{ height: peaks ? `${Math.max(6, peaks[i] * 100)}%` : "6%" }}
        />
      ))}
    </div>
  );
}

/**
 * A sound's real waveform, drawn from an offline render. Each new `pulse`
 * lights the bars and runs a playhead across for the sound's length.
 */
export function SoundWave({
  sound,
  pulse,
  className,
}: {
  sound: Sound;
  pulse: number;
  className?: string;
}) {
  const peaks = usePeaks(sound);
  const reduce = useReducedMotion();
  // Short sounds still get a sweep the eye can follow.
  const sweep = Math.max(0.3, sound.duration);

  return (
    <div className={cn("relative h-12 w-full overflow-hidden", className)}>
      <Bars
        peaks={peaks}
        className={cn(
          "bg-muted-foreground/25 transition-opacity duration-300",
          peaks ? "opacity-100" : "opacity-50",
        )}
      />
      {pulse > 0 ? (
        <motion.div
          key={pulse}
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: sweep + 0.25, ease: EASE_OUT }}
        >
          <Bars peaks={peaks} className="bg-primary" />
        </motion.div>
      ) : null}
      {pulse > 0 && !reduce ? (
        <motion.div
          key={`head-${pulse}`}
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-full"
          initial={{ x: "0%", opacity: 1 }}
          animate={{ x: "100%", opacity: 0 }}
          transition={{ duration: sweep, ease: "linear", opacity: { duration: sweep, ease: EASE_OUT } }}
        >
          <span className="absolute inset-y-0 left-0 w-px bg-primary" />
        </motion.div>
      ) : null}
    </div>
  );
}

export interface SoundPadProps {
  name: string;
  /** The sound drawn in the waveform. */
  sound: Sound;
  /** Bumped on every play to run the waveform animation. */
  pulse: number;
  onPress: () => void;
  /** Keyboard shortcut shown in the corner. */
  keyHint?: string;
  /** Replaces the plain name, for example with a link to the sound's page. */
  nameSlot?: ReactNode;
  className?: string;
}

/** A card that plays a sound when pressed and draws its waveform. */
export function SoundPad({ name, sound, pulse, onPress, keyHint, nameSlot, className }: SoundPadProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-[transform,border-color] duration-150 has-[button:active]:scale-[0.98] has-[button:hover]:border-(--color-border-strong) motion-reduce:has-[button:active]:scale-100",
        className,
      )}
    >
      <button
        type="button"
        onClick={onPress}
        aria-label={`Play ${name}`}
        className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <SoundWave sound={sound} pulse={pulse} className="pointer-events-none" />
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="relative font-medium text-foreground">{nameSlot ?? name}</span>
        <span className="pointer-events-none flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-muted-foreground tabular-nums">
          {Math.round(sound.duration * 1000)} ms
          {keyHint ? (
            <kbd className="hidden size-5 items-center sm:inline-flex justify-center rounded-md border border-border font-sans text-[11px] uppercase">
              {keyHint}
            </kbd>
          ) : null}
        </span>
      </div>
    </div>
  );
}

/** Plays `sounds` in turn and tracks the pulse for one pad. */
export function useSoundPad(sounds: Sound[]) {
  const [state, setState] = useState({ index: 0, pulse: 0 });
  const play = () => {
    sounds[state.index % sounds.length].play();
    setState((current) => ({ index: current.index + 1, pulse: current.pulse + 1 }));
  };
  // The waveform shows the sound that just played.
  const shown = sounds[(state.index + sounds.length - (state.pulse > 0 ? 1 : 0)) % sounds.length];
  return { play, pulse: state.pulse, sound: shown };
}

/** One sound on its own page: a single large pad. */
export function SoundPreviewPad({ name, sounds }: { name: string; sounds: Sound[] }) {
  const pad = useSoundPad(sounds);
  return (
    <div className="flex w-full justify-center px-4">
      <SoundPad
        name={sounds.length > 1 ? `${name} (${pad.sound.name.toLowerCase()})` : name}
        sound={pad.sound}
        pulse={pad.pulse}
        onPress={pad.play}
        className="w-full max-w-sm"
      />
    </div>
  );
}
