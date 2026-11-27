import { defineSound } from "./engine";

/** An inward folding tone settling into a soft tap, for collapsing panels and closing drawers. */
export const collapseSound = defineSound({
  name: "Collapse",
  duration: 0.13,
  room: 0.14,
  build: (v) => {
    v.noise({ filter: "lowpass", freq: 1200, to: 350, attack: 0.008, decay: 0.09, gain: 0.4 });
    v.tone({ freq: 520, to: 200, decay: 0.08, gain: 0.28 });
    v.click({ freq: 1400, q: 1.2, at: 0.065, decay: 0.005, gain: 0.25 });
    v.strike({ freq: 220, material: "wood", at: 0.065, decay: 0.04, gain: 0.35 });
  },
});
