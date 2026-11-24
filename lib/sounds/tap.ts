import { defineSound } from "./engine";

/** A light glass tick over a soft knock, for taps and plain clicks. */
export const tapSound = defineSound({
  name: "Tap",
  duration: 0.08,
  vary: 0.03,
  build: (v) => {
    v.tone({ freq: 2600, decay: 0.035, gain: 0.5 });
    v.tone({ freq: 4170, decay: 0.02, gain: 0.15 });
    v.noise({ filter: "lowpass", freq: 600, decay: 0.02, gain: 0.35 });
  },
});
