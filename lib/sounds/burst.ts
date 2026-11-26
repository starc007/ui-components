import { defineSound } from "./engine";

/** A celebratory triple-pop sparkle, for rewards, confetti celebrations and level-ups. */
export const burstSound = defineSound({
  name: "Burst",
  duration: 0.28,
  room: 0.25,
  build: (v) => {
    for (const [at, freq, gain] of [
      [0.0, 750, 0.4],
      [0.035, 1150, 0.45],
      [0.07, 1650, 0.5],
    ] as const) {
      v.click({ freq: 3500, q: 1.5, at, decay: 0.003, gain: 0.18 });
      v.strike({ freq, material: "mallet", at, decay: 0.14, gain });
    }
  },
});
