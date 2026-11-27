import { defineSound } from "./engine";

/** A crisp tactile stroke and warm upward acoustic knock, for checking off a task. */
export const checkSound = defineSound({
  name: "Check",
  duration: 0.12,
  vary: 0.03,
  room: 0.1,
  build: (v) => {
    v.click({ freq: 3200, q: 1.6, decay: 0.004, gain: 0.45 });
    v.strike({ freq: 520, material: "wood", decay: 0.04, gain: 0.5 });
    v.click({ freq: 4800, q: 1.8, at: 0.04, decay: 0.003, gain: 0.4 });
    v.strike({ freq: 980, material: "mallet", at: 0.04, decay: 0.06, gain: 0.55 });
  },
});
