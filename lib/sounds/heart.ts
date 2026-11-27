import { defineSound } from "./engine";

/** A warm two-beat acoustic pulse, for likes, favorites and bookmark interactions. */
export const heartSound = defineSound({
  name: "Heart",
  duration: 0.3,
  room: 0.18,
  build: (v) => {
    v.click({ freq: 600, q: 0.8, decay: 0.008, gain: 0.3 });
    v.strike({ freq: 72, material: "wood", decay: 0.08, gain: 0.75 });
    v.click({ freq: 700, q: 0.8, at: 0.08, decay: 0.008, gain: 0.3 });
    v.strike({ freq: 88, material: "wood", at: 0.08, decay: 0.1, gain: 0.7 });
  },
});
