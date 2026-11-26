import { audioOutput, getAudioContext } from "@/lib/audio-context";

// Every beUI sound is a short recipe played with Web Audio the moment it is
// asked for. Nothing is downloaded. Recipes are built the way a real tap
// sounds: a contact click (a millisecond of filtered noise), a body that
// rings at a few inharmonic partials of a material and settles in pitch, and
// a little of a small room behind it.

/** Options for one play of a sound. */
export interface PlayOptions {
  /** 0 to 1, multiplied with the page-wide volume from `SoundProvider`. */
  volume?: number;
  /** Pitch multiplier; 1 is the designed pitch. */
  pitch?: number;
}

/** Where a sound renders: the live context, or an offline one for drawing. */
export interface SoundTarget {
  context: BaseAudioContext;
  destination: AudioNode;
  /** Start time on the context clock, in seconds. */
  when: number;
  volume: number;
  pitch: number;
}

/** A plain oscillator with an attack, a decay and an optional glide. */
export interface ToneSpec {
  type?: OscillatorType;
  /** Start frequency in Hz. */
  freq: number;
  /** End frequency in Hz; glides from `freq` over `glide`. */
  to?: number;
  /** Glide time in seconds; defaults to the attack plus decay. */
  glide?: number;
  /** Starts this many times higher and settles to `freq` in about 15 ms, like a struck object. */
  bend?: number;
  /** Delay from the sound's start, in seconds. */
  at?: number;
  /** Fade-in time in seconds. */
  attack?: number;
  /** Time to fade to silence after the attack, in seconds. */
  decay: number;
  gain: number;
}

/** A burst of filtered white noise. */
export interface NoiseSpec {
  filter?: BiquadFilterType;
  /** Filter frequency in Hz. */
  freq: number;
  /** End filter frequency in Hz; sweeps from `freq` over the decay. */
  to?: number;
  q?: number;
  /** Delay from the sound's start, in seconds. */
  at?: number;
  /** Fade-in time in seconds. */
  attack?: number;
  /** Time to fade to silence after the attack, in seconds. */
  decay: number;
  gain: number;
}

/** The contact of a tap: a few milliseconds of band-passed noise with an instant attack. */
export interface ClickSpec {
  /** Band center in Hz: 1-2 kHz is a soft knock, 3-5 kHz a crisp click. */
  freq: number;
  /** Band width; higher is narrower and more tonal. */
  q?: number;
  /** Delay from the sound's start, in seconds. */
  at?: number;
  /** Time to fade to silence, in seconds. */
  decay?: number;
  gain: number;
}

/** How a material rings: partials as [frequency ratio, level], and how fast high ones die. */
export interface Material {
  partials: readonly (readonly [ratio: number, level: number])[];
  /** Higher partials decay in `decay / ratio ** damping`; wood is high, metal low. */
  damping: number;
}

// Partial ratios follow the modes of small struck objects: a free bar for
// wood and metal, a cup for glass, a tuned bar for the mallet.
export const MATERIALS = {
  wood: { partials: [[1, 1], [2.76, 0.3], [5.4, 0.08]], damping: 1.3 },
  plastic: { partials: [[1, 1], [2.43, 0.4], [4.86, 0.14]], damping: 0.9 },
  glass: { partials: [[1, 1], [2.32, 0.42], [4.25, 0.2], [6.63, 0.08]], damping: 0.55 },
  metal: { partials: [[1, 1], [2.76, 0.5], [5.4, 0.26], [8.93, 0.1]], damping: 0.4 },
  mallet: { partials: [[1, 1], [3.99, 0.2], [9.14, 0.05]], damping: 0.8 },
  bell: { partials: [[1, 1], [2.0, 0.34], [2.76, 0.2], [5.4, 0.07]], damping: 0.5 },
} satisfies Record<string, Material>;

/** A struck object: one partial per mode of its material, each with its own decay. */
export interface StrikeSpec {
  /** Fundamental in Hz. */
  freq: number;
  /** A name from `MATERIALS` or your own partials. Default: "plastic". */
  material?: keyof typeof MATERIALS | Material;
  /** Starts this many times higher and settles in about 15 ms. Default: 1.01. */
  bend?: number;
  /** Delay from the sound's start, in seconds. */
  at?: number;
  /** Time for the fundamental to fade to silence, in seconds. */
  decay: number;
  gain: number;
}

export interface Voice {
  tone(spec: ToneSpec): void;
  noise(spec: NoiseSpec): void;
  click(spec: ClickSpec): void;
  strike(spec: StrikeSpec): void;
}

export interface Sound {
  /** Display name, like "Tap". */
  name: string;
  /** Length in seconds; the room tail rings a little past it. */
  duration: number;
  /** Plays the sound now. Silent during SSR and while sounds are muted. */
  play(options?: PlayOptions): void;
  /** Schedules the sound on any context; `play` uses the live one. */
  render(target: SoundTarget): void;
}

export interface SoundRecipe {
  /** Display name, like "Tap". */
  name: string;
  /** Length in seconds; the room tail rings a little past it. */
  duration: number;
  /** Random pitch spread per play (0.04 = ±4%), so repeats don't sound stamped. */
  vary?: number;
  /** How much of the small room the sound is played in, 0 (dry) to 1. Default: 0.12. */
  room?: number;
  /** Adds the sound's layers to the voice on each play. */
  build: (voice: Voice) => void;
}

// Keeps a sum of voices well under clipping at volume 1.
const MASTER_GAIN = 0.16;
const SILENT = 0.0001;
// Time a strike or bend takes to settle onto its pitch.
const SETTLE = 0.015;

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/** One second of white noise per context, shared by every noise voice. */
export function noiseBuffer(context: BaseAudioContext) {
  let buffer = noiseBuffers.get(context);
  if (!buffer) {
    buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(context, buffer);
  }
  return buffer;
}

// A small, soft room: 8 early reflections, then a diffuse tail that falls
// 60 dB in 0.3 s and darkens as it fades, the way air and soft walls
// absorb highs first. Generated once per context.
const ROOM_LENGTH = 0.3;
// The convolver's equal-power normalization leaves the room about 15 dB
// under the dry sound; this brings `room: 0.12` to a tail heard only as space.
const ROOM_GAIN = 6;
const roomBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

function roomBuffer(context: BaseAudioContext) {
  let buffer = roomBuffers.get(context);
  if (!buffer) {
    const rate = context.sampleRate;
    const length = Math.ceil(ROOM_LENGTH * rate);
    buffer = context.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let smooth = 0;
      for (let i = Math.floor(0.004 * rate); i < length; i++) {
        const t = i / rate;
        // One-pole low-pass whose cutoff closes over the tail.
        const brightness = 0.7 * Math.exp(-t / 0.08) + 0.08;
        smooth += brightness * (Math.random() * 2 - 1 - smooth);
        data[i] = smooth * Math.exp(-t / 0.043);
      }
      for (let r = 0; r < 8; r++) {
        const at = Math.floor((0.005 + Math.random() * 0.022) * rate);
        data[at] += (Math.random() < 0.5 ? -1 : 1) * (0.5 - r * 0.05);
      }
    }
    roomBuffers.set(context, buffer);
  }
  return buffer;
}

// One convolver per output node, shared by every play: building one is the
// expensive part, sending to it is cheap.
const rooms = new WeakMap<AudioNode, ConvolverNode>();

function roomFor(context: BaseAudioContext, destination: AudioNode) {
  let room = rooms.get(destination);
  if (!room) {
    room = context.createConvolver();
    room.buffer = roomBuffer(context);
    room.connect(destination);
    rooms.set(destination, room);
  }
  return room;
}

/** A linear attack to `peak`, then an exponential fall to silence. */
function envelope(param: AudioParam, start: number, attack: number, decay: number, peak: number) {
  param.setValueAtTime(0, start);
  param.linearRampToValueAtTime(Math.max(peak, SILENT), start + attack);
  param.exponentialRampToValueAtTime(SILENT, start + attack + decay);
}

function voiceFor(target: SoundTarget, output: AudioNode): Voice {
  const { context, when, pitch } = target;
  // Partials above this only add hiss on small speakers, or alias near Nyquist.
  const ceiling = Math.min(12000, context.sampleRate * 0.45);

  const tone: Voice["tone"] = ({ type = "sine", freq, to, glide, bend, at = 0, attack = 0.002, decay, gain }) => {
    const start = when + at;
    const osc = context.createOscillator();
    const amp = context.createGain();
    osc.type = type;
    const base = freq * pitch;
    osc.frequency.setValueAtTime(base * (bend ?? 1), start);
    if (bend !== undefined) osc.frequency.exponentialRampToValueAtTime(base, start + SETTLE);
    if (to !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(to * pitch, start + Math.max(glide ?? attack + decay, SETTLE));
    }
    envelope(amp.gain, start, attack, decay, gain);
    osc.connect(amp).connect(output);
    osc.start(start);
    osc.stop(start + attack + decay + 0.02);
  };

  const noise: Voice["noise"] = ({ filter = "bandpass", freq, to, q = 1, at = 0, attack = 0.002, decay, gain }) => {
    const start = when + at;
    const source = context.createBufferSource();
    const shape = context.createBiquadFilter();
    const amp = context.createGain();
    source.buffer = noiseBuffer(context);
    shape.type = filter;
    shape.Q.value = q;
    shape.frequency.setValueAtTime(freq * pitch, start);
    if (to !== undefined) {
      shape.frequency.exponentialRampToValueAtTime(to * pitch, start + attack + decay);
    }
    envelope(amp.gain, start, attack, decay, gain);
    source.connect(shape).connect(amp).connect(output);
    // A random offset into the buffer keeps each burst a little different.
    source.start(start, Math.random() * 0.5);
    source.stop(start + attack + decay + 0.02);
  };

  return {
    tone,
    noise,
    click({ freq, q = 2, at = 0, decay = 0.005, gain }) {
      // A little spread on the band, so no two contacts are identical.
      noise({ freq: freq * (0.94 + Math.random() * 0.12), q, at, attack: 0.0005, decay, gain });
    },
    strike({ freq, material = "plastic", bend = 1.01, at = 0, decay, gain }) {
      const { partials, damping } = typeof material === "string" ? MATERIALS[material] : material;
      for (const [ratio, level] of partials) {
        if (freq * ratio * pitch * bend > ceiling) continue;
        tone({
          // Real objects are never perfectly tuned; a hair of detune per partial.
          freq: freq * ratio * (1 + (Math.random() * 2 - 1) * 0.003),
          bend,
          at,
          attack: 0.001,
          decay: decay / ratio ** damping,
          gain: gain * level,
        });
      }
    },
  };
}

/** Turns a recipe into a playable sound. */
export function defineSound({ name, duration, vary = 0, room = 0.12, build }: SoundRecipe): Sound {
  const render = (target: SoundTarget) => {
    const { context, destination } = target;
    const output = context.createGain();
    output.gain.value = MASTER_GAIN * target.volume;
    output.connect(destination);
    if (room > 0) {
      const send = context.createGain();
      send.gain.value = room * ROOM_GAIN;
      output.connect(send).connect(roomFor(context, destination));
    }
    build(voiceFor(target, output));
  };

  return {
    name,
    duration,
    render,
    play({ volume = 1, pitch = 1 } = {}) {
      const context = getAudioContext();
      if (!context || volume <= 0) return;
      const spread = vary ? 1 + (Math.random() * 2 - 1) * vary : 1;
      render({
        context,
        // The page-wide volume is applied there.
        destination: audioOutput(context),
        when: context.currentTime + 0.005,
        volume,
        pitch: pitch * spread,
      });
    },
  };
}
