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

/** Elements inside `container` that Tab can reach, in DOM order. */
export function focusablesIn(container: Element | null | undefined) {
  return Array.from(
    container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
  ).filter((element) => element.tabIndex >= 0 && !element.closest("[inert]"));
}

/** Focuses the first tabbable element in `panel`, or the panel itself. */
export function focusFirstIn(panel: HTMLElement | null | undefined) {
  (focusablesIn(panel)[0] ?? panel)?.focus({ preventScroll: true });
}

/**
 * Keeps a Tab keypress inside `panel`, wrapping from the last tabbable element
 * to the first and back. Give the panel `tabIndex={-1}` so it can hold focus
 * when it has nothing tabbable.
 */
export function cycleTab(event: KeyboardEvent, panel: HTMLElement | null) {
  if (event.key !== "Tab" || !panel) return;
  const elements = focusablesIn(panel);
  const first = elements[0];
  const last = elements[elements.length - 1];
  const active = document.activeElement;
  if (!first || !last) {
    event.preventDefault();
    panel.focus({ preventScroll: true });
  } else if (event.shiftKey && (active === first || active === panel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
