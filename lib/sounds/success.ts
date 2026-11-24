import { defineSound } from "./engine";

/** Two soft mallet notes rising a fifth, for a saved or completed action. */
export const successSound = defineSound({
  name: "Success",
  duration: 0.5,
  build: (v) => {
    v.tone({ freq: 1047, decay: 0.25, gain: 0.55 });
    v.tone({ freq: 2094, decay: 0.08, gain: 0.12 });
    v.tone({ freq: 1568, at: 0.085, decay: 0.35, gain: 0.55 });
    v.tone({ freq: 3136, at: 0.085, decay: 0.1, gain: 0.1 });
  },
});
