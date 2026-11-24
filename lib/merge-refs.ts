import type { Ref } from "react";

/** Points a callback or object ref at `value`. */
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/** One callback ref that sets every ref it is given. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) assignRef(ref, node);
  };
}
