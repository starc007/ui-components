import { defineSound } from "./engine";

/** A rounded liquid droplet pop, for incoming chat bubbles, reactions and comments. */
export const bubbleSound = defineSound({
  name: "Bubble",
  duration: 0.07,
  vary: 0.04,
  room: 0.1,
  build: (v) => {
    v.click({ freq: 1600, q: 1.2, decay: 0.003, gain: 0.25 });
    v.tone({ freq: 420, to: 1650, glide: 0.045, decay: 0.055, gain: 0.65 });
  },
});
