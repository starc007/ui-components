import { getAudioContext } from "@/lib/audio-context";

// Every beUI sound is a short recipe of tones and filtered noise, played with
// Web Audio the moment it is asked for. Nothing is downloaded.

/** Options for one play of a sound. */
export interface PlayOptions {
  /** 0 to 1, multiplied with the master volume. */
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

export interface ToneSpec {
  type?: OscillatorType;
  /** Start frequency in Hz. */
  freq: number;
  /** End frequency in Hz; glides from `freq` over `glide`. */
  to?: number;
  /** Glide time in seconds; defaults to the decay. */
  glide?: number;
  /** Delay from the sound's start, in seconds. */
  at?: number;
  attack?: number;
  /** Time to fade to silence after the attack, in seconds. */
  decay: number;
  gain: number;
}

export interface NoiseSpec {
  filter?: BiquadFilterType;
  /** Filter frequency in Hz. */
  freq: number;
  /** End filter frequency in Hz; sweeps from `freq` over the decay. */
  to?: number;
  q?: number;
  at?: number;
  attack?: number;
  decay: number;
  gain: number;
}

export interface Voice {
  tone(spec: ToneSpec): void;
  noise(spec: NoiseSpec): void;
}

export interface Sound {
  /** Display name, like "Tap". */
  name: string;
  /** Length in seconds, tail included. */
  duration: number;
  /** Plays the sound now. Silent during SSR and while sounds are muted. */
  play(options?: PlayOptions): void;
  /** Schedules the sound on any context; `play` uses the live one. */
  render(target: SoundTarget): void;
}

export interface SoundRecipe {
  name: string;
  duration: number;
  /** Random pitch spread per play (0.04 = ±4%), so repeats don't sound stamped. */
  vary?: number;
  build: (voice: Voice) => void;
}

// Keeps a sum of voices well under clipping at volume 1.
const MASTER_GAIN = 0.16;
const SILENT = 0.0001;

let masterVolume = 1;

/** Scales every beUI sound, 0 to 1. `SoundProvider` sets it from `volume`. */
export function setMasterVolume(volume: number) {
  masterVolume = Math.min(1, Math.max(0, volume));
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseBuffer(context: BaseAudioContext) {
  let buffer = noiseBuffers.get(context);
  if (!buffer) {
    buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(context, buffer);
  }
  return buffer;
}

function envelope(param: AudioParam, start: number, attack: number, decay: number, peak: number) {
  param.setValueAtTime(SILENT, start);
  param.exponentialRampToValueAtTime(Math.max(peak, SILENT), start + attack);
  param.exponentialRampToValueAtTime(SILENT, start + attack + decay);
}

function voiceFor(target: SoundTarget, output: AudioNode): Voice {
  const { context, when, pitch } = target;
  return {
    tone({ type = "sine", freq, to, glide, at = 0, attack = 0.002, decay, gain }) {
      const start = when + at;
      const osc = context.createOscillator();
      const amp = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq * pitch, start);
      if (to !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(to * pitch, start + (glide ?? attack + decay));
      }
      envelope(amp.gain, start, attack, decay, gain);
      osc.connect(amp).connect(output);
      osc.start(start);
      osc.stop(start + attack + decay + 0.02);
    },
    noise({ filter = "bandpass", freq, to, q = 1, at = 0, attack = 0.002, decay, gain }) {
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
    },
  };
}

/** Turns a recipe into a playable sound. */
export function defineSound({ name, duration, vary = 0, build }: SoundRecipe): Sound {
  const render = (target: SoundTarget) => {
    const output = target.context.createGain();
    output.gain.value = MASTER_GAIN * target.volume;
    output.connect(target.destination);
    build(voiceFor(target, output));
  };

  return {
    name,
    duration,
    render,
    play({ volume = 1, pitch = 1 } = {}) {
      const context = getAudioContext();
      const level = volume * masterVolume;
      if (!context || level <= 0) return;
      const spread = vary ? 1 + (Math.random() * 2 - 1) * vary : 1;
      render({
        context,
        destination: context.destination,
        when: context.currentTime + 0.005,
        volume: level,
        pitch: pitch * spread,
      });
    },
  };
}
