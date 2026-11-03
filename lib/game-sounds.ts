// Synthesized game feedback (gem chimes that climb with a streak, a mine's
// blast, a cash-out arpeggio) built from oscillators and noise at runtime, so
// there are no audio files to ship.

type AudioContextCtor = typeof AudioContext;

const MASTER_GAIN = 0.12;
// Pentatonic steps from G5, so any run of gems stays in key. Two octaves of
// climb tops out at G7, bright but not shrill.
const BASE = 783.99;
const SCALE = [0, 2, 4, 7, 9];

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  );
}

// One context for every player on the page, closed when the last one is
// disposed (the same model as lib/tick-sound.ts).
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let consumers = 0;

function ensureContext() {
  if (!ctx) {
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);
  }
  // Browsers may refuse outside a user gesture; prepare() runs inside one.
  if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
  return ctx;
}

/** A pitched tone with a fast attack and exponential decay. */
function tone(
  context: AudioContext,
  frequency: number,
  at: number,
  { duration = 0.18, type = "sine", gain = 1 }: { duration?: number; type?: OscillatorType; gain?: number } = {},
) {
  if (!master) return;
  const osc = context.createOscillator();
  const env = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(env).connect(master);
  osc.start(at);
  osc.stop(at + duration + 0.02);
  osc.onended = () => env.disconnect();
}

function note(step: number) {
  const octave = Math.floor(step / SCALE.length);
  const semitones = SCALE[step % SCALE.length] + octave * 12;
  return BASE * 2 ** (semitones / 12);
}

export interface GameSounds {
  /** Unlock audio; call from a click or key handler. */
  prepare: () => void;
  /** A gem; `streak` counts gems in a row, from 1. */
  gem: (streak: number) => void;
  /** A mine. */
  mine: () => void;
  /** Cashing out. */
  cashOut: () => void;
  dispose: () => void;
}

/**
 * Lazily-initialized game sounds sharing one AudioContext. Nothing is created
 * until the first call. Safe during SSR and without Web Audio: every call
 * becomes a silent no-op.
 */
export function createGameSounds(): GameSounds {
  consumers++;
  let disposed = false;
  const live = () => (disposed ? null : ensureContext());

  return {
    prepare() {
      live();
    },
    gem(streak) {
      const context = live();
      if (!context) return;
      const now = context.currentTime;
      // Each gem in a row climbs the scale, capped two octaves up.
      const frequency = note(Math.min(streak - 1, SCALE.length * 2));
      // Glassy: a sine fundamental with a quiet triangle an octave up.
      tone(context, frequency, now, { gain: 0.9 });
      tone(context, frequency * 2, now, { type: "triangle", gain: 0.15, duration: 0.12 });
      // From the third gem in a row, a sparkle a fifth above answers the chime…
      if (streak >= 3) tone(context, frequency * 1.5, now + 0.05, { gain: 0.25, duration: 0.1 });
      // …and every fifth adds a quick run up to it.
      if (streak % 5 === 0) {
        [-2, -1].forEach((offset, index) => {
          tone(context, note(Math.max(0, streak - 1 + offset)), now - 0.06 + index * 0.03, { gain: 0.35, duration: 0.08 });
        });
      }
    },
    mine() {
      const context = live();
      if (!context || !master) return;
      const now = context.currentTime;
      // A burst of noise swept down through a low-pass filter…
      const length = Math.ceil(context.sampleRate * 0.45);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.4);
      const env = context.createGain();
      env.gain.setValueAtTime(1.1, now);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      noise.connect(filter).connect(env).connect(master);
      noise.start(now);
      noise.onended = () => env.disconnect();
      // …over a low thump that drops in pitch.
      const thump = context.createOscillator();
      const thumpEnv = context.createGain();
      thump.type = "sine";
      thump.frequency.setValueAtTime(110, now);
      thump.frequency.exponentialRampToValueAtTime(42, now + 0.3);
      thumpEnv.gain.setValueAtTime(1.4, now);
      thumpEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      thump.connect(thumpEnv).connect(master);
      thump.start(now);
      thump.stop(now + 0.34);
      thump.onended = () => thumpEnv.disconnect();
    },
    cashOut() {
      const context = live();
      if (!context) return;
      const now = context.currentTime;
      // A rising major arpeggio, C5 E5 G5 C6, ending on a held shimmer.
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        const last = index === 3;
        tone(context, frequency, now + index * 0.06, { type: "triangle", gain: 0.6, duration: last ? 0.45 : 0.14 });
        if (last) tone(context, frequency * 2, now + index * 0.06, { gain: 0.15, duration: 0.5 });
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      consumers = Math.max(0, consumers - 1);
      if (consumers === 0 && ctx) {
        void ctx.close();
        ctx = null;
        master = null;
      }
    },
  };
}
