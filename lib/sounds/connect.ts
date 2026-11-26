import { defineSound } from "./engine";

/** A positive two-step connection chord, for connecting integrations, wallets and devices. */
export const connectSound = defineSound({
  name: "Connect",
  duration: 0.25,
  room: 0.18,
  build: (v) => {
    v.click({ freq: 2200, q: 1.5, decay: 0.004, gain: 0.3 });
    v.tone({ freq: 440, attack: 0.005, decay: 0.08, gain: 0.4 });
    v.click({ freq: 3600, q: 1.8, at: 0.06, decay: 0.003, gain: 0.35 });
    v.strike({ freq: 880, material: "metal", at: 0.06, decay: 0.16, gain: 0.5 });
  },
});
