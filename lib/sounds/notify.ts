import { defineSound } from "./engine";

/** A small struck bell with a slow shimmer, for a new message or toast. */
export const notifySound = defineSound({
  name: "Notify",
  duration: 0.55,
  room: 0.3,
  build: (v) => {
    v.click({ freq: 5000, q: 1.5, decay: 0.003, gain: 0.16 });
    v.strike({ freq: 1568, material: "bell", bend: 1.004, decay: 0.48, gain: 0.42 });
    // A twin 5 Hz sharp beats against it: the shimmer of a real bell.
    v.tone({ freq: 1573, decay: 0.45, gain: 0.2 });
  },
});
