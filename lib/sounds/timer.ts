import { defineSound } from "./engine";

/** A dry hollow woodblock pulse, for countdown timers, metronomes and turn-counters. */
export const timerSound = defineSound({
  name: "Timer",
  duration: 0.06,
  room: 0,
  build: (v) => {
    v.click({ freq: 3600, q: 2, decay: 0.003, gain: 0.5 });
    v.strike({ freq: 780, material: "wood", bend: 1.15, decay: 0.03, gain: 0.65 });
  },
});
