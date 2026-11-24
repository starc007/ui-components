import { defineSound } from "./engine";

/** A rising snap, for switching something on. */
export const toggleOnSound = defineSound({
  name: "Toggle on",
  duration: 0.1,
  build: (v) => {
    v.tone({ type: "triangle", freq: 520, to: 880, glide: 0.06, decay: 0.07, gain: 0.7 });
    v.noise({ filter: "highpass", freq: 3000, decay: 0.01, gain: 0.2 });
  },
});

/** The same snap falling, for switching something off. */
export const toggleOffSound = defineSound({
  name: "Toggle off",
  duration: 0.1,
  build: (v) => {
    v.tone({ type: "triangle", freq: 760, to: 440, glide: 0.06, decay: 0.07, gain: 0.7 });
    v.noise({ filter: "highpass", freq: 3000, decay: 0.01, gain: 0.2 });
  },
});
