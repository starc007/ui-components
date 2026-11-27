import { defineSound } from "./engine";

/** Two soft descending mallet notes, for incoming chat messages and replies. */
export const receiveSound = defineSound({
  name: "Receive",
  duration: 0.32,
  room: 0.22,
  build: (v) => {
    v.click({ freq: 4000, q: 1.2, decay: 0.003, gain: 0.18 });
    v.strike({ freq: 1318.5, material: "mallet", decay: 0.18, gain: 0.45 });
    v.click({ freq: 3500, q: 1.2, at: 0.065, decay: 0.003, gain: 0.18 });
    v.strike({ freq: 880, material: "mallet", at: 0.065, decay: 0.24, gain: 0.5 });
  },
});
