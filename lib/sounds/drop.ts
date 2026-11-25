import { defineSound } from "./engine";

/** A soft thud with a small bounce, like an item settling on a desk, for dropping a dragged item into place. */
export const dropSound = defineSound({
  name: "Drop",
  duration: 0.14,
  room: 0.12,
  build: (v) => {
    v.click({ freq: 1500, q: 1, decay: 0.005, gain: 0.18 });
    v.noise({ filter: "lowpass", freq: 700, attack: 0.001, decay: 0.03, gain: 0.35 });
    v.strike({ freq: 140, material: "wood", bend: 1.4, decay: 0.09, gain: 0.9 });
    v.click({ freq: 1500, q: 1, at: 0.075, decay: 0.004, gain: 0.07 });
    v.strike({ freq: 150, material: "wood", bend: 1.3, at: 0.075, decay: 0.05, gain: 0.3 });
  },
});
