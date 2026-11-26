import { defineSound } from "./engine";

/** A quick airy flick that drops away, for dismissing toasts and notifications. */
export const dismissSound = defineSound({
  name: "Dismiss",
  duration: 0.14,
  room: 0.1,
  build: (v) => {
    v.noise({ filter: "bandpass", freq: 2200, to: 500, q: 0.9, decay: 0.09, gain: 0.5 });
    v.tone({ freq: 620, to: 180, decay: 0.08, gain: 0.3 });
  },
});
