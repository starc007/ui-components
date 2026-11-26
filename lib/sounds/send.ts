import { defineSound } from "./engine";

/** An upward airy whoosh with a clean release tap, for sending messages and emails. */
export const sendSound = defineSound({
  name: "Send",
  duration: 0.18,
  room: 0.15,
  build: (v) => {
    v.noise({ filter: "bandpass", freq: 800, to: 2800, q: 1, decay: 0.12, gain: 0.5 });
    v.tone({ freq: 440, to: 1200, attack: 0.01, decay: 0.1, gain: 0.35 });
    v.click({ freq: 3800, q: 1.5, at: 0.09, decay: 0.004, gain: 0.25 });
  },
});
