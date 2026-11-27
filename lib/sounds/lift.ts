import { defineSound } from "./engine";

/** A soft lift click with rising resonance, for picking up or starting to drag an item. */
export const liftSound = defineSound({
  name: "Lift",
  duration: 0.1,
  vary: 0.03,
  room: 0.08,
  build: (v) => {
    v.click({ freq: 2400, q: 1.2, decay: 0.004, gain: 0.35 });
    v.strike({ freq: 160, material: "wood", bend: 1.25, decay: 0.05, gain: 0.5 });
    v.tone({ freq: 180, to: 340, attack: 0.005, decay: 0.06, gain: 0.25 });
  },
});
