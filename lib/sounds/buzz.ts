import { defineSound } from "./engine";

/** A short low haptic buzz, for rejected input, validation errors or boundary collisions. */
export const buzzSound = defineSound({
  name: "Buzz",
  duration: 0.09,
  room: 0.05,
  build: (v) => {
    v.tone({ type: "sawtooth", freq: 125, attack: 0.004, decay: 0.075, gain: 0.35 });
    v.strike({ freq: 95, material: "wood", decay: 0.07, gain: 0.4 });
  },
});
