import { defineSound } from "./engine";

/** A rapid mechanical aperture leaf snap with metallic body ring, for camera snapshots. */
export const shutterSound = defineSound({
  name: "Shutter",
  duration: 0.09,
  vary: 0.02,
  room: 0.12,
  build: (v) => {
    v.click({ freq: 4400, q: 2, decay: 0.003, gain: 0.55 });
    v.strike({ freq: 1850, material: "metal", decay: 0.025, gain: 0.4 });
    v.click({ freq: 2800, q: 1.4, at: 0.028, decay: 0.004, gain: 0.45 });
    v.strike({ freq: 950, material: "metal", at: 0.028, decay: 0.04, gain: 0.45 });
  },
});
