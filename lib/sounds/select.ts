import { defineSound } from "./engine";

/** A crisp detent, for tabs, segmented controls and menu choices. */
export const selectSound = defineSound({
  name: "Select",
  duration: 0.05,
  build: (v) => {
    v.tone({ type: "triangle", freq: 1650, decay: 0.03, gain: 0.6 });
    v.noise({ filter: "highpass", freq: 4000, decay: 0.008, gain: 0.2 });
  },
});
