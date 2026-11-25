import { defineSound } from "./engine";

/** Two quick rising glass ticks, like a small duplicate, for copying to the clipboard. */
export const copySound = defineSound({
  name: "Copy",
  duration: 0.1,
  room: 0.1,
  build: (v) => {
    v.click({ freq: 4200, q: 2, decay: 0.003, gain: 0.3 });
    v.strike({ freq: 1900, material: "glass", decay: 0.03, gain: 0.4 });
    v.click({ freq: 5000, q: 2, at: 0.055, decay: 0.003, gain: 0.3 });
    v.strike({ freq: 2500, material: "glass", at: 0.055, decay: 0.035, gain: 0.4 });
  },
});
