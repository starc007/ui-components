import { defineSound } from "./engine";

/** Two quick rising ticks, for copying to the clipboard. */
export const copySound = defineSound({
  name: "Copy",
  duration: 0.1,
  build: (v) => {
    v.tone({ type: "triangle", freq: 1900, decay: 0.02, gain: 0.5 });
    v.tone({ type: "triangle", freq: 2500, at: 0.055, decay: 0.025, gain: 0.5 });
  },
});
