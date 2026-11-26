"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  registerSoundSettings,
  retainAudioContext,
  type SoundSettingsEntry,
} from "@/lib/audio-context";
import type { PlayOptions, Sound } from "@/lib/sounds/engine";

export interface SoundSettings {
  /** False mutes every beUI sound under the provider. */
  enabled: boolean;
  /** 0 to 1, scales every beUI sound. */
  volume: number;
}

const SoundContext = createContext<SoundSettings & { depth: number }>({
  enabled: true,
  volume: 1,
  depth: 0,
});

/**
 * App-wide sound settings. `enabled={false}` mutes every beUI sound, from
 * component `sound` props and `useSound` to the games, Wheel Picker and
 * Bookshelf, and `volume` scales them all. Without a provider, sounds play at
 * full volume. A nested provider overrides the one around it.
 */
export function SoundProvider({
  enabled = true,
  volume = 1,
  children,
}: Partial<SoundSettings> & { children: ReactNode }) {
  const depth = useContext(SoundContext).depth + 1;
  const value = useMemo(() => ({ enabled, volume, depth }), [enabled, volume, depth]);

  // Module-level as well (lib/audio-context.ts), so players outside React
  // and `sound.play()` obey it too.
  const entry = useRef<SoundSettingsEntry>({ depth, enabled, volume });
  const registration = useRef<ReturnType<typeof registerSoundSettings> | null>(null);
  useEffect(() => {
    registration.current = registerSoundSettings(entry.current);
    return () => {
      registration.current?.release();
      registration.current = null;
    };
  }, []);
  useEffect(() => {
    Object.assign(entry.current, { depth, enabled, volume });
    registration.current?.update();
  }, [depth, enabled, volume]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSoundSettings(): SoundSettings {
  return useContext(SoundContext);
}

export interface UseSoundOptions {
  /** False makes `play` do nothing, for a component's `sound` prop. */
  enabled?: boolean;
  /** 0 to 1 for this sound, on top of the provider volume. */
  volume?: number;
}

/**
 * A stable `play()` for one sound. It does nothing while disabled or muted,
 * and keeps the shared audio context warm only while it can play.
 */
export function useSound(sound: Sound, { enabled = true, volume = 1 }: UseSoundOptions = {}) {
  const settings = useSoundSettings();
  const on = enabled && settings.enabled && settings.volume > 0 && volume > 0;
  // Read by the stable callback, so a caller's effects don't re-run when
  // the settings change.
  const latest = useRef({ on, volume, sound });
  useLayoutEffect(() => {
    latest.current = { on, volume, sound };
  });

  useEffect(() => {
    if (!on) return;
    return retainAudioContext();
  }, [on]);

  return useCallback((options?: PlayOptions) => {
    const current = latest.current;
    if (!current.on) return;
    current.sound.play({ ...options, volume: (options?.volume ?? 1) * current.volume });
  }, []);
}
