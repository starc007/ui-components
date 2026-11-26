import { defineSound } from "./engine";

/** A tiny dry metal tick, for counters, sliders, pickers and loading steps. */
export const tickSound = defineSound({
  name: "Tick",
  duration: 0.02,
  vary: 0.02,
  // Dry, so fast repeats on a slider stay separate.
  room: 0,
  build: (v) => {
    v.click({ freq: 5000, q: 3, decay: 0.0025, gain: 0.4 });
    v.strike({ freq: 3400, material: "metal", decay: 0.01, gain: 0.32 });
  },
});
