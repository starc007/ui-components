import { defineSound } from "./engine";

// A real switch clicks twice: a light pre-click as it starts to travel, then
// the snap as it lands. On goes low to high and lands on a higher body; off
// is the mirror, so the two are easy to tell apart.

/** A two-stage snap rising into place, for switching something on. */
export const toggleOnSound = defineSound({
  name: "Toggle on",
  duration: 0.1,
  room: 0.1,
  build: (v) => {
    v.click({ freq: 2000, q: 1.5, decay: 0.004, gain: 0.22 });
    v.click({ freq: 3800, q: 2, at: 0.024, decay: 0.005, gain: 0.5 });
    v.strike({ freq: 980, material: "plastic", bend: 1.05, at: 0.024, decay: 0.045, gain: 0.5 });
    v.strike({ freq: 190, material: "wood", bend: 1.3, at: 0.024, decay: 0.03, gain: 0.35 });
  },
});

/** The same snap falling into place, for switching something off. */
export const toggleOffSound = defineSound({
  name: "Toggle off",
  duration: 0.1,
  room: 0.1,
  build: (v) => {
    v.click({ freq: 3800, q: 2, decay: 0.004, gain: 0.22 });
    v.click({ freq: 2000, q: 1.5, at: 0.024, decay: 0.005, gain: 0.5 });
    v.strike({ freq: 640, material: "plastic", bend: 1.05, at: 0.024, decay: 0.045, gain: 0.5 });
    v.strike({ freq: 160, material: "wood", bend: 1.3, at: 0.024, decay: 0.03, gain: 0.35 });
  },
});
