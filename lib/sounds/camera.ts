import { defineSound } from "./engine";

/** A two-stroke camera shutter: an initial mirror-flip click and a second curtain strike. */
export const cameraSound = defineSound({
  name: "Camera",
  duration: 0.12,
  vary: 0.03,
  room: 0.15,
  build: (v) => {
    v.click({ freq: 2800, q: 1.4, decay: 0.005, gain: 0.5 });
    v.strike({ freq: 320, material: "plastic", decay: 0.02, gain: 0.35 });
    v.click({ freq: 1600, q: 1.2, at: 0.038, decay: 0.008, gain: 0.65 });
    v.strike({ freq: 850, material: "metal", at: 0.038, decay: 0.045, gain: 0.45 });
  },
});
