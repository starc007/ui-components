import { defineSound } from "./engine";

/** Two quick rising metal clicks, like a mechanical tumbler releasing, for unlocking. */
export const unlockSound = defineSound({
  name: "Unlock",
  duration: 0.14,
  room: 0.12,
  build: (v) => {
    v.click({ freq: 2200, q: 1.6, at: 0.01, decay: 0.004, gain: 0.4 });
    v.strike({ freq: 1800, material: "metal", at: 0.01, decay: 0.025, gain: 0.35 });
    v.click({ freq: 3600, q: 2, at: 0.032, decay: 0.004, gain: 0.5 });
    v.strike({ freq: 2400, material: "metal", at: 0.032, decay: 0.035, gain: 0.45 });
  },
});
