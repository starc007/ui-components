import { defineSound } from "./engine";

/** A three-note ascending arpeggio on tuned bells, for milestones and completions. */
export const chimeSound = defineSound({
  name: "Chime",
  duration: 0.4,
  room: 0.3,
  build: (v) => {
    for (const [at, freq] of [
      [0.0, 880],
      [0.035, 1108.7],
      [0.07, 1318.5],
    ] as const) {
      v.click({ freq: 4500, q: 1.2, at, decay: 0.003, gain: 0.15 });
      v.strike({ freq, material: "bell", at, decay: 0.32, gain: 0.4 });
    }
  },
});
