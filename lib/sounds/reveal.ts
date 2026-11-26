import { defineSound } from "./engine";

/** A soft upward glass flourish, for revealing hidden content, passwords and secret keys. */
export const revealSound = defineSound({
  name: "Reveal",
  duration: 0.22,
  room: 0.2,
  build: (v) => {
    v.click({ freq: 4200, q: 1.8, decay: 0.003, gain: 0.25 });
    v.tone({ freq: 587.3, to: 1174.6, glide: 0.08, attack: 0.01, decay: 0.14, gain: 0.45 });
    v.strike({ freq: 1760, material: "glass", at: 0.06, decay: 0.14, gain: 0.4 });
  },
});
