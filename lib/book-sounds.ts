// Synthesized bookshelf feedback (a cloth-on-wood slide as a book comes off
// the shelf, the same slide back in that seats with a soft knock, and a dry
// tap as a finger runs along the spines) built from noise and a sine at
// runtime, so there are no audio files to ship.

import { getAudioContext, retainAudioContext } from "@/lib/audio-context";

const MASTER_GAIN = 0.16;
// Running the pointer quickly along the spines riffles them, but not faster
// than this, so a fast sweep stays a texture instead of a buzz.
const MIN_TAP_GAP = 0.045; // seconds

// The context is shared page-wide (lib/audio-context.ts). The master gain and
// the noise buffer belong to it, so they are rebuilt if it was closed and
// recreated.
let output: { master: GainNode; noise: AudioBuffer } | null = null;

function ensureOutput() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (output?.master.context !== ctx) {
    const master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);
    const length = Math.ceil(ctx.sampleRate * 0.5);
    const noise = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    output = { master, noise };
  }
  return { ctx, ...output };
}

/** Band-passed noise whose centre sweeps from `from` to `to` Hz: cloth sliding on wood. */
function slide(
  ctx: AudioContext,
  out: { master: GainNode; noise: AudioBuffer },
  at: number,
  { from, to, duration, gain }: { from: number; to: number; duration: number; gain: number },
) {
  const source = ctx.createBufferSource();
  source.buffer = out.noise;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(to, at + duration);
  const env = ctx.createGain();
  // Soft in, long tail out: friction builds, then the book glides free.
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + duration * 0.25);
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(filter).connect(env).connect(out.master);
  source.start(at, Math.random() * 0.2);
  source.stop(at + duration + 0.02);
  source.onended = () => env.disconnect();
}

/** A short pitched knock that drops in pitch: a board meeting the shelf. */
function knock(
  ctx: AudioContext,
  out: { master: GainNode },
  at: number,
  { frequency, gain }: { frequency: number; gain: number },
) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, at);
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.55, at + 0.08);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);
  osc.connect(env).connect(out.master);
  osc.start(at);
  osc.stop(at + 0.13);
  osc.onended = () => env.disconnect();
}

export interface BookSounds {
  /** Unlock audio; call from a click, tap or key handler. */
  prepare: () => void;
  /** A book sliding off the shelf. */
  pull: () => void;
  /** A book sliding back in and seating. */
  push: () => void;
  /** A finger catching a spine. */
  tap: () => void;
  dispose: () => void;
}

/**
 * Lazily-initialized bookshelf sounds on the page's shared AudioContext.
 * Nothing is created until the first call. Safe during SSR and without Web
 * Audio: every call becomes a silent no-op.
 */
export function createBookSounds(): BookSounds {
  const release = retainAudioContext();
  let disposed = false;
  let lastTap = 0;
  const live = () => (disposed ? null : ensureOutput());

  return {
    prepare() {
      live();
    },
    pull() {
      const ready = live();
      if (!ready) return;
      const { ctx } = ready;
      const now = ctx.currentTime;
      // The book drags against its neighbours on the way out, rising as it
      // frees, then the cover lands face-on with a light knock.
      slide(ctx, ready, now, { from: 700, to: 2400, duration: 0.26, gain: 0.9 });
      knock(ctx, ready, now + 0.2, { frequency: 420, gain: 0.25 });
    },
    push() {
      const ready = live();
      if (!ready) return;
      const { ctx } = ready;
      const now = ctx.currentTime;
      // The reverse slide, falling, then a lower knock as it seats.
      slide(ctx, ready, now, { from: 2200, to: 650, duration: 0.26, gain: 0.8 });
      knock(ctx, ready, now + 0.24, { frequency: 230, gain: 0.55 });
    },
    tap() {
      const ready = live();
      if (!ready) return;
      const { ctx } = ready;
      const now = ctx.currentTime;
      if (now - lastTap < MIN_TAP_GAP) return;
      lastTap = now;
      // Barely there, and a little different each time, like real spines.
      slide(ctx, ready, now, {
        from: 2600 + Math.random() * 900,
        to: 1800,
        duration: 0.045,
        gain: 0.35,
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      release();
    },
  };
}
