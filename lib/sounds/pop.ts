import { defineSound } from "./engine";

/** A rounded bubbly pop sweeping quickly upward, for chips, badges and notifications. */
export const popSound = defineSound({
  name: "Pop",
  duration: 0.06,
  vary: 0.04,
  room: 0.08,
  build: (v) => {
    v.click({ freq: 1800, q: 1, decay: 0.003, gain: 0.3 });
    v.tone({ freq: 220, to: 750, glide: 0.035, decay: 0.04, gain: 0.65 });
  },
});
