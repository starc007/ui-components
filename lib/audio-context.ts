// One AudioContext for every synthesized sound on the page (lib/tick-sound.ts,
// lib/game-sounds.ts). Browsers cap concurrent contexts, and a page can show a
// date made of several WheelPickers next to a game, so they all share this
// one. It is created on first use and closed once every player is disposed.

type AudioContextCtor = typeof AudioContext;

let context: AudioContext | null = null;
let users = 0;
// Cleared by a muted SoundProvider (lib/sound.tsx): every player that reads
// the context goes silent, without each component tracking the setting.
let allowed = true;

/** Lets every beUI sound on the page play, or silences them all. */
export function setSoundsAllowed(next: boolean) {
  allowed = next;
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
    }
  };
}

/**
 * The shared context, created on first call and resumed if suspended. Null
 * during SSR, in browsers without Web Audio, and while sounds are muted.
 */
export function getAudioContext(): AudioContext | null {
  if (!allowed) return null;
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
