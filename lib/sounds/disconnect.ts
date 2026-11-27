import { defineSound } from "./engine";

/** A gentle downward release pop, for unlinking accounts or disconnecting devices. */
export const disconnectSound = defineSound({
  name: "Disconnect",
  duration: 0.18,
  room: 0.14,
  build: (v) => {
    v.click({ freq: 3200, q: 1.4, decay: 0.004, gain: 0.35 });
    v.strike({ freq: 660, material: "plastic", decay: 0.05, gain: 0.45 });
    v.click({ freq: 1800, q: 1.2, at: 0.05, decay: 0.005, gain: 0.3 });
    v.strike({ freq: 330, material: "wood", at: 0.05, decay: 0.08, gain: 0.5 });
  },
});
