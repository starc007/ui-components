import { defineSound } from "./engine";

/** A sharp mechanical latch click, for magnets, grid snapping and docking into place. */
export const snapSound = defineSound({
  name: "Snap",
  duration: 0.05,
  vary: 0.02,
  room: 0.08,
  build: (v) => {
    v.click({ freq: 4200, q: 2, decay: 0.003, gain: 0.55 });
    v.strike({ freq: 1200, material: "plastic", decay: 0.025, gain: 0.4 });
    v.strike({ freq: 320, material: "wood", bend: 1.2, decay: 0.03, gain: 0.45 });
  },
});
