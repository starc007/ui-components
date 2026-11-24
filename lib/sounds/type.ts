import { defineSound } from "./engine";

/** A short keystroke, for text fields, search and chat inputs. */
export const typeSound = defineSound({
  name: "Type",
  duration: 0.05,
  vary: 0.08,
  build: (v) => {
    v.noise({ freq: 3200, q: 1.4, decay: 0.018, gain: 0.7 });
    v.tone({ freq: 420, to: 300, decay: 0.02, gain: 0.25 });
  },
});
