// Synthesizes a short, dry mechanical detent for gesture feedback (e.g. the
// WheelPicker row-cross click) entirely at runtime. Several inharmonic modes
// make it read as a tiny physical impact instead of an oscillator beep, while
// the high-passed transient gives it definition through phone speakers.

import { getAudioContext, retainAudioContext } from "@/lib/audio-context";

const DURATION = 0.016; // seconds, short enough to stay distinct during a fling
const MASTER_GAIN = 0.055;

const MODES = [
  { frequency: 980, decay: 0.0038, gain: 0.5, phase: 0 },
  { frequency: 1820, decay: 0.0024, gain: 0.3, phase: 0.65 },
  { frequency: 3160, decay: 0.00115, gain: 0.12, phase: 1.3 },
] as const;

// The context is shared page-wide (lib/audio-context.ts). The gain and the
// click buffer belong to it, so they are rebuilt if it was closed and
// recreated.
let output: { gain: GainNode; buffer: AudioBuffer } | null = null;

function buildClickBuffer(context: AudioContext): AudioBuffer {
  const sampleRate = context.sampleRate;
  const length = Math.ceil(DURATION * sampleRate);
  const buffer = context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  let peak = 0;
  let previousNoise = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.00012);
    const fadeOut = Math.min(1, (DURATION - t) / 0.001);
    let resonance = 0;
    for (const mode of MODES) {
      resonance +=
        Math.sin(2 * Math.PI * mode.frequency * t + mode.phase) *
        Math.exp(-t / mode.decay) *
        mode.gain;
    }

    // Differencing consecutive noise samples removes the low, papery part of
    // white noise and leaves only a tiny impact at the front of the sound.
    const noise = Math.random() * 2 - 1;
    const transient =
      (noise - previousNoise) * Math.exp(-t / 0.00038) * 0.035;
    previousNoise = noise;

    data[i] = (resonance + transient) * attack * fadeOut;
    peak = Math.max(peak, Math.abs(data[i]));
  }
  if (peak > 0) {
    const norm = 0.9 / peak;
    for (let i = 0; i < length; i++) data[i] *= norm;
  }

  return buffer;
}

function prepareOutput() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (output?.gain.context !== ctx) {
    const gain = ctx.createGain();
    gain.gain.value = MASTER_GAIN;
    gain.connect(ctx.destination);
    output = { gain, buffer: buildClickBuffer(ctx) };
  }
  return { ctx, ...output };
}

interface TickPlayer {
  prepare: () => void;
  /** `rate` below 1 plays a lower, longer tick; above 1 a higher, shorter one. */
  play: (rate?: number) => void;
  dispose: () => void;
}

/**
 * Lazily-initialized tick player. No `AudioContext` is created until the first
 * `prepare()` or `play()` call anywhere on the page. Every player shares the
 * same context and buffer; the context closes once the last player anywhere
 * on the page is disposed. Safe during SSR or in browsers without Web Audio:
 * `prepare()` and `play()` become silent no-ops.
 */
export function createTickPlayer(): TickPlayer {
  const release = retainAudioContext();
  let disposed = false;
  let activeSource: AudioBufferSourceNode | null = null;

  return {
    prepare() {
      if (disposed) return;
      prepareOutput();
    },
    play(rate = 1) {
      if (disposed) return;
      const ready = prepareOutput();
      if (!ready) return;
      const { ctx, gain, buffer } = ready;
      // A fast fling can cross rows more quickly than the tail of a tick.
      // Cutting that tail keeps the feedback dry instead of stacking into a
      // louder metallic ring.
      activeSource?.stop();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rate;
      source.connect(gain);
      source.onended = () => {
        source.disconnect();
        if (activeSource === source) activeSource = null;
      };
      activeSource = source;
      source.start();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      activeSource?.stop();
      activeSource = null;
      release();
    },
  };
}
