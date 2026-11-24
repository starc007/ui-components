import { defineSound } from "./engine";

/** A single small bell with a shimmer, for a new message or toast. */
export const notifySound = defineSound({
  name: "Notify",
  duration: 0.55,
  build: (v) => {
    v.tone({ freq: 1568, decay: 0.45, gain: 0.5 });
    v.tone({ freq: 1572, decay: 0.45, gain: 0.25 });
    v.tone({ freq: 4328, decay: 0.08, gain: 0.12 });
  },
});
