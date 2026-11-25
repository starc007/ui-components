import { defineSound } from "./engine";

/** A keystroke: the key's click, its spring, and a soft thock as it bottoms out. */
export const typeSound = defineSound({
  name: "Type",
  duration: 0.05,
  vary: 0.08,
  room: 0.06,
  build: (v) => {
    v.click({ freq: 3200, q: 1.2, decay: 0.007, gain: 0.55 });
    v.click({ freq: 6200, q: 3, at: 0.005, decay: 0.002, gain: 0.12 });
    v.strike({ freq: 330, material: "wood", bend: 1.2, at: 0.004, decay: 0.025, gain: 0.35 });
  },
});
