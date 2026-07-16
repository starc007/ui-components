// Synthesizes a short filtered-noise "tick" for gesture feedback (e.g. the
// WheelPicker row-cross click) entirely at runtime — no audio asset ships, so
// the sound travels through the copy-paste registry with whatever component
// imports it, instead of 404ing as an unbundled public/ file would.

const DURATION = 0.02; // seconds, total click length
const ATTACK = 0.001; // seconds, near-instant onset
const DECAY_TAU = 0.006; // seconds, exponential decay time constant
const FILTER_FREQ = 2200; // Hz, bandpass center
const FILTER_Q = 1;
const MASTER_GAIN = 0.12;
const DETUNE_RANGE = 40; // cents, ± random pitch variation between ticks

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext
  );
}

// One shared context/buffer/gain for the whole page, ref-counted across every
// `createTickPlayer()` caller. Components like WheelPicker commonly compose
// several side by side (a date made of month/day/year drums) — giving each
// its own AudioContext would waste resources and risk hitting a browser's cap
// on concurrent contexts. The context only closes once every consumer that
// created a player has called `dispose()`.
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let clickBuffer: AudioBuffer | null = null;
let consumers = 0;

// RBJ cookbook bandpass (constant 0 dB peak gain), applied as a direct-form
// biquad difference equation over the buffer in one pass — no
// OfflineAudioContext needed, so the buffer builds synchronously.
function bandpass(samples: Float32Array, sampleRate: number, freq: number, q: number) {
  const w0 = (2 * Math.PI * freq) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const cosw0 = Math.cos(w0);
  const a0 = 1 + alpha;
  const b0 = alpha / a0;
  const b2 = -alpha / a0;
  const a1 = (-2 * cosw0) / a0;
  const a2 = (1 - alpha) / a0;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    const y0 = b0 * x0 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
    samples[i] = y0;
  }
}

function buildClickBuffer(context: AudioContext): AudioBuffer {
  const sampleRate = context.sampleRate;
  const length = Math.ceil(DURATION * sampleRate);
  const buffer = context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  bandpass(data, sampleRate, FILTER_FREQ, FILTER_Q);

  let peak = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = t < ATTACK ? t / ATTACK : Math.exp(-(t - ATTACK) / DECAY_TAU);
    data[i] *= envelope;
    peak = Math.max(peak, Math.abs(data[i]));
  }
  if (peak > 0) {
    const norm = 0.9 / peak;
    for (let i = 0; i < length; i++) data[i] *= norm;
  }

  return buffer;
}

function ensureContext() {
  if (ctx) return;
  const Ctor = getAudioContextCtor();
  if (!Ctor) return;
  ctx = new Ctor();
  masterGain = ctx.createGain();
  masterGain.gain.value = MASTER_GAIN;
  masterGain.connect(ctx.destination);
  clickBuffer = buildClickBuffer(ctx);
}

/**
 * Lazily-initialized tick player. No `AudioContext` is created until the
 * first `play()` call anywhere on the page — every `createTickPlayer()`
 * caller shares the same context/buffer, ref-counted so `dispose()` only
 * tears it down once the last consumer is gone. Safe to call during SSR or
 * in browsers without Web Audio: `play()` becomes a silent no-op.
 */
export function createTickPlayer(): { play: () => void; dispose: () => void } {
  consumers++;
  let disposed = false;

  return {
    play() {
      if (disposed) return;
      ensureContext();
      if (!ctx || !masterGain || !clickBuffer) return;
      if (ctx.state === "suspended") ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = clickBuffer;
      source.detune.value = (Math.random() * 2 - 1) * DETUNE_RANGE;
      source.connect(masterGain);
      source.start();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      consumers = Math.max(0, consumers - 1);
      if (consumers === 0 && ctx) {
        ctx.close();
        ctx = null;
        masterGain = null;
        clickBuffer = null;
      }
    },
  };
}
