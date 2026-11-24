import { defineSound } from "./engine";

/** A tiny tick, for counters, sliders, pickers and loading steps. */
export const tickSound = defineSound({
  name: "Tick",
  duration: 0.02,
  vary: 0.02,
  build: (v) => {
    v.tone({ freq: 3400, decay: 0.009, gain: 0.45 });
    v.noise({ filter: "highpass", freq: 6000, decay: 0.004, gain: 0.15 });
  },
});
