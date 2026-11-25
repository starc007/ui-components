import { defineSound } from "./engine";

/** A fingertip on glass: a crisp contact, a small glass ring and a soft knock under it. */
export const tapSound = defineSound({
  name: "Tap",
  duration: 0.08,
  vary: 0.04,
  room: 0.1,
  build: (v) => {
    v.click({ freq: 3600, q: 1.6, decay: 0.004, gain: 0.55 });
    v.strike({ freq: 2150, material: "glass", decay: 0.04, gain: 0.32 });
    v.strike({ freq: 210, material: "wood", bend: 1.25, decay: 0.03, gain: 0.45 });
  },
});
