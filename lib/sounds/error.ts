import { defineSound } from "./engine";

/** Two dull wooden knocks falling, with a soft beat in each, for a failed action. */
export const errorSound = defineSound({
  name: "Error",
  duration: 0.35,
  room: 0.15,
  build: (v) => {
    for (const [at, freq, decay] of [
      [0, 330, 0.12],
      [0.1, 262, 0.2],
    ] as const) {
      v.click({ freq: 1200, q: 1, at, decay: 0.006, gain: 0.28 });
      v.strike({ freq, material: "wood", bend: 1.08, at, decay, gain: 0.5 });
      // A second body a hair flat beats against the first: the old buzz, softened.
      v.tone({ freq: freq * 1.012, at, decay: decay * 0.8, gain: 0.18 });
      v.tone({ freq: freq / 2, bend: 1.2, at, decay: decay * 0.5, gain: 0.22 });
    }
  },
});
