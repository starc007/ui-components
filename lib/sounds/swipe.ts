import { defineSound } from "./engine";

/** An airy whoosh with subtle friction contact, for gesture swipes, carousels and page turns. */
export const swipeSound = defineSound({
  name: "Swipe",
  duration: 0.12,
  vary: 0.04,
  room: 0.1,
  build: (v) => {
    v.noise({ filter: "bandpass", freq: 1600, to: 600, q: 0.8, decay: 0.1, gain: 0.45 });
    v.tone({ freq: 380, to: 160, attack: 0.005, decay: 0.08, gain: 0.25 });
  },
});
