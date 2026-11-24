import { defineSound } from "./engine";

/** A soft thud with a small bounce, for dropping a dragged item into place. */
export const dropSound = defineSound({
  name: "Drop",
  duration: 0.14,
  build: (v) => {
    v.tone({ freq: 150, to: 95, decay: 0.09, gain: 0.9 });
    v.noise({ filter: "lowpass", freq: 900, decay: 0.03, gain: 0.35 });
    v.tone({ freq: 140, to: 100, at: 0.07, decay: 0.05, gain: 0.3 });
  },
});
