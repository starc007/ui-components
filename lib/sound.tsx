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
import { retainAudioContext, setSoundsAllowed } from "@/lib/audio-context";
import { type PlayOptions, type Sound, setMasterVolume } from "@/lib/sounds/engine";

export interface SoundSettings {
  /** False mutes every beUI sound under the provider. */
  enabled: boolean;
  /** 0 to 1, scales every beUI sound. */
  volume: number;
}

const SoundContext = createContext<SoundSettings>({ enabled: true, volume: 1 });

/**
 * App-wide sound settings. `enabled={false}` mutes every beUI sound, from
 * component `sound` props and `useSound` to the games, and `volume` scales
 * them all. Without a provider, sounds play at full volume.
 */
export function SoundProvider({
  enabled = true,
  volume = 1,
  children,
}: Partial<SoundSettings> & { children: ReactNode }) {
  const value = useMemo(() => ({ enabled, volume }), [enabled, volume]);
  // Module-level, so `sound.play()` called outside React obeys it too.
  useEffect(() => {
    setSoundsAllowed(enabled);
    setMasterVolume(volume);
    return () => {
      setSoundsAllowed(true);
      setMasterVolume(1);
    };
  }, [enabled, volume]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSoundSettings() {
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
