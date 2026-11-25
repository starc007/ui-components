import { defineSound } from "./engine";

/** Two even taps on a small glass block, for a heads-up that needs a look. */
export const warningSound = defineSound({
  name: "Warning",
  duration: 0.3,
  room: 0.18,
  build: (v) => {
    for (const at of [0, 0.12]) {
      v.click({ freq: 2200, q: 1.4, at, decay: 0.004, gain: 0.22 });
      v.strike({ freq: 740, material: "glass", at, decay: 0.1, gain: 0.45 });
    }
  },
});
