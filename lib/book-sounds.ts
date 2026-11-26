// Synthesized bookshelf feedback, built from noise and a sine at runtime so
// there are no audio files to ship:
// - pull: a finger catches the spine, the book drags out against its
//   neighbours with a grainy cloth-on-wood friction, and the board lands
//   face-on with a soft papery thump;
// - push: the same friction going back in, then a woody tock as it seats;
// - tap: a dry tick as a finger runs along the spines.
// Every sound is noise shaped by a filter and an envelope; pitched tones only
// add a short, low body under a thump, never a melody, so nothing reads as
// a synth.

import { getAudioContext, playerGain, retainAudioContext } from "@/lib/audio-context";

const MASTER_GAIN = 0.2;
// Running the pointer quickly along the spines riffles them, but not faster
// than this, so a fast sweep stays a texture instead of a buzz.
const MIN_TAP_GAP = 0.045; // seconds
// When the animation reaches the moment each sound marks. The book pulls
// most of the way out and its cover comes round by about here...
const LAND_AT = 0.2;
// ...and on the way back the push, which starts a beat after the turn,
// seats the book about here.
const SEAT_AT = 0.22;

type Output = { master: GainNode; white: AudioBuffer; friction: AudioBuffer };

// The context is shared page-wide (lib/audio-context.ts). The noise buffers
// belong to it, so they are rebuilt if it was closed and recreated.
const buffers = new WeakMap<AudioContext, Omit<Output, "master">>();

function whiteNoise(ctx: AudioContext, seconds: number) {
  const length = Math.ceil(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/**
 * Noise with a stick-slip grain: its loudness wanders every few
 * milliseconds, with the odd louder catch, the way cloth judders across
 * wood. Filtered, it reads as friction rather than air.
 */
function frictionNoise(ctx: AudioContext, seconds: number) {
  const length = Math.ceil(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const grain = Math.max(1, Math.round(ctx.sampleRate * 0.003));
  let target = 0.6;
  let amp = 0.6;
  for (let i = 0; i < length; i++) {
    if (i % grain === 0) {
      target = Math.random() < 0.06 ? 1.5 : 0.3 + Math.random() * 0.7;
    }
    amp += (target - amp) * 0.02;
    data[i] = (Math.random() * 2 - 1) * amp;
  }
  return buffer;
}

function ensureOutput() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  let noise = buffers.get(ctx);
  if (!noise) {
    noise = { white: whiteNoise(ctx, 0.5), friction: frictionNoise(ctx, 0.6) };
    buffers.set(ctx, noise);
  }
  return { ctx, master: playerGain(ctx, "book", MASTER_GAIN), ...noise };
}

/**
 * Filtered noise that rises over `attack` and then tails off over about
 * `decay`. The tail is a natural decay toward silence rather than a ramp to
 * a fixed floor: a ramp to near-zero falls ~80dB and is gone by its first
 * third, so a slide would sound like a click.
 */
function burst(
  ctx: AudioContext,
  out: Output,
  buffer: AudioBuffer,
  at: number,
  {
    type,
    frequency,
    to,
    q = 0.8,
    attack,
    decay,
    gain,
  }: {
    type: BiquadFilterType;
    frequency: number;
    /** Sweep the filter to this frequency over the sound. */
    to?: number;
    q?: number;
    attack: number;
    decay: number;
    gain: number;
  },
) {
  const peakAt = at + attack;
  // Three time constants of decay is about -26dB, where the sound reads as
  // over; it keeps running to ~-42dB so the tail never cuts off.
  const end = peakAt + decay * 1.6;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(frequency, at);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, peakAt + decay);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, peakAt);
  env.gain.setTargetAtTime(0, peakAt, decay / 3);
  source.connect(filter).connect(env).connect(out.master);
  // A random start in the buffer, so repeats never sound identical.
  const offset = Math.random() * Math.max(0, buffer.duration - (end - at) - 0.01);
  source.start(at, offset);
  source.stop(end + 0.02);
  source.onended = () => env.disconnect();
}

/** A short low sine under a thump: the hollow of a board or a shelf. */
function body(
  ctx: AudioContext,
  out: Output,
  at: number,
  { frequency, decay, gain }: { frequency: number; decay: number; gain: number },
) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, at);
  // Settles a touch flat, like a struck panel, without the drum-like drop.
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.88, at + decay);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.003);
  env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  osc.connect(env).connect(out.master);
  osc.start(at);
  osc.stop(at + decay + 0.02);
  osc.onended = () => env.disconnect();
}

export interface BookSounds {
  /** Unlock audio; call from a click, tap or key handler. */
  prepare: () => void;
  /** A book sliding off the shelf and turning to face the viewer. */
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
  let lastTap = Number.NEGATIVE_INFINITY;
  const live = () => (disposed ? null : ensureOutput());

  return {
    prepare() {
      live();
    },
    pull() {
      const out = live();
      if (!out) return;
      const { ctx } = out;
      const now = ctx.currentTime;
      // The finger catches the spine: a tiny dry tick.
      burst(ctx, out, out.white, now, {
        type: "highpass",
        frequency: 3200,
        attack: 0.001,
        decay: 0.012,
        gain: 0.3,
      });
      // Out it drags, brightening as it frees from its neighbours.
      burst(ctx, out, out.friction, now + 0.008, {
        type: "bandpass",
        frequency: 850,
        to: 2000,
        q: 0.7,
        attack: 0.05,
        decay: 0.17,
        gain: 0.75,
      });
      // The board comes round and lands face-on: soft, papery, a little hollow.
      burst(ctx, out, out.white, now + LAND_AT, {
        type: "lowpass",
        frequency: 1100,
        q: 0.5,
        attack: 0.002,
        decay: 0.06,
        gain: 0.45,
      });
      body(ctx, out, now + LAND_AT, { frequency: 190, decay: 0.07, gain: 0.22 });
    },
    push() {
      const out = live();
      if (!out) return;
      const { ctx } = out;
      const now = ctx.currentTime;
      // Back in it drags, darkening as it slides between its neighbours.
      burst(ctx, out, out.friction, now, {
        type: "bandpass",
        frequency: 1800,
        to: 750,
        q: 0.7,
        attack: 0.04,
        decay: 0.17,
        gain: 0.65,
      });
      // It seats with a woody tock: the contact click, the thump of the
      // board on the shelf, and the shelf's low hollow under it.
      burst(ctx, out, out.white, now + SEAT_AT, {
        type: "highpass",
        frequency: 2200,
        attack: 0.001,
        decay: 0.01,
        gain: 0.35,
      });
      burst(ctx, out, out.white, now + SEAT_AT, {
        type: "lowpass",
        frequency: 600,
        q: 0.6,
        attack: 0.002,
        decay: 0.08,
        gain: 0.75,
      });
      body(ctx, out, now + SEAT_AT, { frequency: 115, decay: 0.09, gain: 0.4 });
    },
    tap() {
      const out = live();
      if (!out) return;
      const { ctx } = out;
      const now = ctx.currentTime;
      if (now - lastTap < MIN_TAP_GAP) return;
      lastTap = now;
      // Barely there, and a little different each time, like real spines.
      burst(ctx, out, out.friction, now, {
        type: "bandpass",
        frequency: 2600 + Math.random() * 900,
        to: 1800,
        attack: 0.004,
        decay: 0.04,
        gain: 0.3,
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      release();
    },
  };
}
