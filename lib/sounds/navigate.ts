import { defineSound } from "./engine";

/** A quick airy swish, for moving between pages, steps or slides. */
export const navigateSound = defineSound({
  name: "Navigate",
  duration: 0.1,
  vary: 0.03,
  build: (v) => {
    v.noise({ freq: 900, to: 4000, q: 0.9, attack: 0.03, decay: 0.05, gain: 0.6 });
  },
});
