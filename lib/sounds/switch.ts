import { defineSound } from "./engine";

/** A tactile hardware rocker switch with a double micro-click, for toggle switches. */
export const switchSound = defineSound({
  name: "Switch",
  duration: 0.07,
  vary: 0.03,
  room: 0.1,
  build: (v) => {
    v.click({ freq: 2600, q: 1.5, decay: 0.004, gain: 0.45 });
    v.strike({ freq: 720, material: "plastic", decay: 0.02, gain: 0.35 });
    v.click({ freq: 3800, q: 1.8, at: 0.022, decay: 0.004, gain: 0.5 });
    v.strike({ freq: 1400, material: "plastic", at: 0.022, decay: 0.03, gain: 0.4 });
  },
});
