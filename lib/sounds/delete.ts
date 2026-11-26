import { defineSound } from "./engine";

/** A short paper crumple that drops away, for removing or trashing an item. */
export const deleteSound = defineSound({
  name: "Delete",
  duration: 0.2,
  room: 0.15,
  build: (v) => {
    // Crackles at random moments, each a little lower and quieter, so every
    // crumple is different.
    for (let i = 0; i < 7; i++) {
      const at = i * 0.016 + Math.random() * 0.012;
      v.click({ freq: 3000 - i * 300, q: 1.2, at, decay: 0.006 + Math.random() * 0.006, gain: 0.7 - i * 0.07 });
    }
    v.noise({ filter: "lowpass", freq: 2200, to: 300, q: 0.7, attack: 0.005, decay: 0.14, gain: 0.5 });
    v.tone({ freq: 240, to: 110, attack: 0.004, decay: 0.12, gain: 0.35 });
  },
});
