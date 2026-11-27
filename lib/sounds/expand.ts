import { defineSound } from "./engine";

/** A gentle blooming whoosh opening outward, for expanding accordions, cards and sheets. */
export const expandSound = defineSound({
  name: "Expand",
  duration: 0.15,
  room: 0.15,
  build: (v) => {
    v.noise({ filter: "lowpass", freq: 400, to: 1400, attack: 0.02, decay: 0.11, gain: 0.4 });
    v.tone({ freq: 220, to: 520, attack: 0.015, decay: 0.12, gain: 0.3 });
  },
});
