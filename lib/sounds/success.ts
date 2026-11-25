import { defineSound } from "./engine";

/** Two soft mallet notes on a wooden bar, rising a fifth, for a saved or completed action. */
export const successSound = defineSound({
  name: "Success",
  duration: 0.5,
  room: 0.25,
  build: (v) => {
    v.click({ freq: 2500, q: 1, decay: 0.004, gain: 0.18 });
    v.strike({ freq: 1047, material: "mallet", decay: 0.28, gain: 0.5 });
    v.click({ freq: 2500, q: 1, at: 0.085, decay: 0.004, gain: 0.18 });
    v.strike({ freq: 1568, material: "mallet", at: 0.085, decay: 0.38, gain: 0.5 });
  },
});
