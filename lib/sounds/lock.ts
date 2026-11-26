import { defineSound } from "./engine";

/** A solid mechanical latch engaging with a tumbler click and deep lock body thump. */
export const lockSound = defineSound({
  name: "Lock",
  duration: 0.12,
  room: 0.14,
  build: (v) => {
    v.click({ freq: 3400, q: 1.8, decay: 0.004, gain: 0.45 });
    v.strike({ freq: 1950, material: "metal", decay: 0.03, gain: 0.5 });
    v.strike({ freq: 160, material: "wood", bend: 1.3, decay: 0.06, gain: 0.7 });
  },
});
