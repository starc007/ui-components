import { defineSound } from "./engine";

/** An ultra-soft acoustic puff, for subtle hover hints, tooltips and micro-badges. */
export const whisperSound = defineSound({
  name: "Whisper",
  duration: 0.08,
  vary: 0.03,
  room: 0.06,
  build: (v) => {
    v.noise({ filter: "lowpass", freq: 1100, attack: 0.008, decay: 0.05, gain: 0.25 });
    v.strike({ freq: 480, material: "plastic", decay: 0.025, gain: 0.2 });
  },
});
