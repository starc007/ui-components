import { defineSound } from "./engine";

/** A crisp detent, like a dial clicking into a notch, for tabs, segmented controls and menu choices. */
export const selectSound = defineSound({
  name: "Select",
  duration: 0.05,
  room: 0.08,
  build: (v) => {
    v.click({ freq: 4500, q: 2.5, decay: 0.003, gain: 0.45 });
    v.strike({ freq: 1700, material: "metal", decay: 0.028, gain: 0.3 });
    v.strike({ freq: 520, material: "wood", bend: 1.15, decay: 0.012, gain: 0.25 });
  },
});
