/**
 * Every open overlay on the page, innermost last: focus traps, modal scopes
 * and dismissable menus all register here. Overlays have no shared z-order to
 * consult, and a menu inside a drawer portals out of it, so this stack is how
 * they agree on who answers Escape and where focus may go.
 */

export interface Layer {
  /** Whether `target` belongs to this layer (its panel, portals, trigger). */
  contains: (target: Node) => boolean;
  /** True for focus traps and modal scopes, which pull stray focus back. */
  traps?: boolean;
  /** False for a layer that ignores Escape, so the key reaches the one below. */
  escape?: boolean;
}

const stack: Layer[] = [];
// The innermost layer when each Escape began, read before any handler runs,
// so a layer that closes itself mid-event can't hand the key to the one below.
const escapeOwners = new WeakMap<Event, Layer | undefined>();
let listening = false;

function innermostEscapeLayer() {
  for (let index = stack.length - 1; index >= 0; index--) {
    if (stack[index].escape !== false) return stack[index];
  }
  return undefined;
}

function recordEscapeOwner(event: KeyboardEvent) {
  if (event.key === "Escape") escapeOwners.set(event, innermostEscapeLayer());
}

/** Registers an open layer. Call the returned function when it closes. */
export function openLayer(layer: Layer) {
  if (!listening) {
    document.addEventListener("keydown", recordEscapeOwner, true);
    listening = true;
  }
  stack.push(layer);
  return () => {
    const index = stack.indexOf(layer);
    if (index !== -1) stack.splice(index, 1);
  };
}

/** Whether this Escape is `layer`'s to answer: it was innermost when the key went down. */
export function ownsEscape(layer: Layer, event: KeyboardEvent) {
  if (event.defaultPrevented) return false;
  const owner = escapeOwners.has(event)
    ? escapeOwners.get(event)
    : innermostEscapeLayer();
  return owner === layer;
}

/** Whether `target` sits in a layer opened on top of `layer`. */
export function inLayerAbove(layer: Layer, target: Node) {
  const index = stack.indexOf(layer);
  return stack.slice(index + 1).some((above) => above.contains(target));
}

/** Whether a focus trap is open on top of `layer`; stray focus is that one's to pull back. */
export function trapAbove(layer: Layer) {
  const index = stack.indexOf(layer);
  return stack.slice(index + 1).some((above) => above.traps);
}

/**
 * Whether `target` belongs to any open layer other than `layer`. Pass
 * `traps: false` to count only dismissable overlays, not the traps under them.
 */
export function inOtherLayer(layer: Layer, target: Node, { traps = true } = {}) {
  return stack.some(
    (other) => other !== layer && (traps || !other.traps) && other.contains(target),
  );
}
