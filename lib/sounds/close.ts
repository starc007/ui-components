import { defineSound } from "./engine";

/** The open whoosh falling and a little quicker, settling with a soft low tap, for things closing. */
export const closeSound = defineSound({
  name: "Close",
  duration: 0.16,
  room: 0.18,
  build: (v) => {
    v.noise({ freq: 2600, to: 700, q: 1.2, attack: 0.012, decay: 0.09, gain: 0.7 });
    v.click({ freq: 1400, q: 1.2, at: 0.05, decay: 0.006, gain: 0.2 });
    v.strike({ freq: 260, material: "wood", bend: 1.2, at: 0.05, decay: 0.045, gain: 0.3 });
  },
});
