import { defineSound } from "./engine";

/** A pure high crystalline bell ring, for mentions, badges and live activity alerts. */
export const pingSound = defineSound({
  name: "Ping",
  duration: 0.35,
  room: 0.25,
  build: (v) => {
    v.click({ freq: 6000, q: 2, decay: 0.002, gain: 0.2 });
    v.strike({ freq: 2349, material: "bell", decay: 0.3, gain: 0.45 });
    v.tone({ freq: 4698, decay: 0.15, gain: 0.15 });
  },
});
