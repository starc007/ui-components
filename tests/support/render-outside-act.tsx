import { act } from "@testing-library/react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

// Renders a tree the way the browser would paint it, rather than the way `act`
// settles it. `commit` lands a commit synchronously, but a state update that a
// passive effect then schedules is still pending when it returns — which is the
// window a real key press lands in. `render-outside-act.test.tsx` pins both
// clauses, since a `commit` that settled passive updates would make every test
// built on this harness pass vacuously.
//
// Only the flushes themselves leave the act environment, so a
// `@testing-library/react` `render` in the same test still behaves normally.
//
// Reach for it only for behaviour that differs between those two moments.
// Anything else belongs in `@testing-library/react`'s `render`.

const flags = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

function outsideAct<T>(work: () => T): T {
  const previous = flags.IS_REACT_ACT_ENVIRONMENT;
  flags.IS_REACT_ACT_ENVIRONMENT = false;
  try {
    return work();
  } finally {
    flags.IS_REACT_ACT_ENVIRONMENT = previous;
  }
}

const live = new Set<() => void>();

/** Tears down every root this harness still owns. Call from `afterEach`. */
export function cleanupOutsideAct() {
  for (const teardown of live) teardown();
  live.clear();
}

export function renderOutsideAct(node: ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  live.add(() => {
    act(() => root.unmount());
    container.remove();
  });

  act(() => {
    root.render(node);
  });

  return {
    container,
    /** Commit without settling what a passive effect then schedules. */
    commit: (next: ReactNode) =>
      outsideAct(() => flushSync(() => root.render(next))),
    /** Flush work already scheduled, without settling passive updates. */
    flushPendingWork: () => outsideAct(() => flushSync(() => {})),
    /** Dispatch a real event, so React handles it the way the browser would. */
    dispatch: (target: EventTarget, event: Event) =>
      outsideAct(() => target.dispatchEvent(event)),
    /** Settle everything, the way `act` would. */
    settle: () => act(async () => {}),
  };
}
