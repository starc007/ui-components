// One AudioContext for every synthesized sound on the page: the sounds
// library (lib/sounds/), the WheelPicker tick (lib/tick-sound.ts), the casino
// games (lib/game-sounds.ts) and Bookshelf (lib/book-sounds.ts). Browsers cap
// concurrent contexts, and a page can show a date made of several WheelPickers
// next to a game, so they all share this one. It is created on first use and
// closed once every player is disposed.
//
// Every player connects to `audioOutput()` rather than the context's
// destination, so the page-wide volume and mute from `SoundProvider`
// (lib/sound.tsx) reach all of them in one place.

type AudioContextCtor = typeof AudioContext;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let users = 0;

/** Settings one mounted `SoundProvider` asks for. */
export interface SoundSettingsEntry {
  /** Nesting depth: the deepest provider decides. */
  depth: number;
  enabled: boolean;
  volume: number;
}

// Mounted providers in mount order. Module state, so `sound.play()` called
// outside React obeys them too. The deepest provider wins; among equals, the
// one mounted last. Effects run child first, so this can't be "whoever ran
// last".
const providers = new Set<SoundSettingsEntry>();
let allowed = true;
let volume = 1;

function applySettings() {
  let chosen: SoundSettingsEntry | undefined;
  for (const entry of providers) {
    if (!chosen || entry.depth >= chosen.depth) chosen = entry;
  }
  allowed = chosen?.enabled ?? true;
  volume = Math.min(1, Math.max(0, chosen?.volume ?? 1));
  if (master) master.gain.value = volume;
}

/**
 * Registers a provider's settings; call `update` after changing the entry and
 * the returned release function when the provider unmounts.
 */
export function registerSoundSettings(entry: SoundSettingsEntry) {
  providers.add(entry);
  applySettings();
  return {
    update: applySettings,
    release() {
      providers.delete(entry);
      applySettings();
    },
  };
}

/**
 * Registers a sound player. Call the returned function when the player is
 * disposed; the context closes after the last one.
 */
export function retainAudioContext() {
  users++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    users--;
    if (users === 0 && context) {
      void context.close();
      context = null;
      master = null;
    }
  };
}

/**
 * The shared context, created on first call and resumed if suspended. Null
 * during SSR, in browsers without Web Audio, and while sounds are muted or at
 * zero volume.
 */
export function getAudioContext(): AudioContext | null {
  if (!allowed || volume <= 0) return null;
  if (!context) {
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  // Browsers may refuse outside a user gesture. Players call this from
  // pointer and key handlers first, so a later call finds it running.
  if (context.state === "suspended") void context.resume().catch(() => undefined);
  return context;
}

/** The node every player connects to: the page-wide volume, then the speakers. */
export function audioOutput(ctx: AudioContext): AudioNode {
  if (master?.context !== ctx) {
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  return master;
}

const gains = new WeakMap<BaseAudioContext, Map<string, GainNode>>();

/**
 * A player's own level, made once per context and routed into `audioOutput`.
 * Players keep their mix this way without rebuilding nodes on every play, and
 * a context closed and recreated gets fresh ones.
 */
export function playerGain(ctx: AudioContext, key: string, level: number): GainNode {
  let byKey = gains.get(ctx);
  if (!byKey) {
    byKey = new Map();
    gains.set(ctx, byKey);
  }
  let gain = byKey.get(key);
  if (!gain) {
    gain = ctx.createGain();
    gain.gain.value = level;
    gain.connect(audioOutput(ctx));
    byKey.set(key, gain);
  }
  return gain;
}
