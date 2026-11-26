import { defineSound } from "./engine";

/** A quick airy slide, like a page passing under a hand, for moving between pages, steps or slides. */
export const navigateSound = defineSound({
  name: "Navigate",
  duration: 0.1,
  vary: 0.03,
  room: 0.15,
  build: (v) => {
    v.noise({ freq: 1000, to: 3600, q: 0.7, attack: 0.025, decay: 0.06, gain: 0.55 });
    v.noise({ freq: 5500, q: 1, attack: 0.02, decay: 0.04, gain: 0.04 });
    v.click({ freq: 2400, q: 1.2, at: 0.055, decay: 0.004, gain: 0.08 });
  },
});
