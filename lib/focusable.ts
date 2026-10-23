/**
 * Elements that can usually take keyboard focus. The selector cannot see
 * everything focus() checks (an element under `display: none`, say), so a
 * caller that needs certainty tries focus() and checks where it landed.
 */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled):not([type='hidden'])",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
