import { defineSound } from "./engine";

/** A bright metallic coin chime with a high contact ping and long ringing overtone. */
export const coinSound = defineSound({
  name: "Coin",
  duration: 0.45,
  vary: 0.02,
  room: 0.28,
  build: (v) => {
    v.click({ freq: 4800, q: 2.5, decay: 0.003, gain: 0.35 });
    v.strike({ freq: 2800, material: "bell", decay: 0.38, gain: 0.5 });
    v.tone({ freq: 3400, decay: 0.28, gain: 0.35 });
  },
});
