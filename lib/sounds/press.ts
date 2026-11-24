import { defineSound } from "./engine";

/** A soft low thump with a bright click on top, for buttons. */
export const pressSound = defineSound({
  name: "Press",
  duration: 0.1,
  vary: 0.02,
  build: (v) => {
    v.tone({ freq: 190, to: 110, decay: 0.07, gain: 0.9 });
    v.tone({ type: "triangle", freq: 2400, decay: 0.012, gain: 0.25 });
  },
});
