import { defineSound } from "./engine";

/** A cushioned magnetic dock thump, for pinning side panels and minimizing windows. */
export const dockSound = defineSound({
  name: "Dock",
  duration: 0.11,
  room: 0.1,
  build: (v) => {
    v.click({ freq: 2200, q: 1.2, decay: 0.004, gain: 0.35 });
    v.strike({ freq: 210, material: "wood", bend: 1.3, decay: 0.05, gain: 0.65 });
    v.strike({ freq: 950, material: "metal", decay: 0.03, gain: 0.35 });
  },
});
