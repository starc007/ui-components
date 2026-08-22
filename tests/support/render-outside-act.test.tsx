import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { useEffect, useState } from "react";
import { cleanupOutsideAct, renderOutsideAct } from "./render-outside-act";

afterEach(cleanup);
afterEach(cleanupOutsideAct);

const flags = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

function PassiveUpdateProbe() {
  const [phase, setPhase] = useState("committed");
  useEffect(() => setPhase("settled"), []);
  return <span data-testid="probe">{phase}</span>;
}

const probe = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-testid='probe']")?.textContent;

test("commit lands the commit but not what a passive effect schedules", async () => {
  const view = renderOutsideAct(<div />);

  view.commit(<PassiveUpdateProbe />);
  expect(probe(view.container)).toBe("committed");

  // The regression tests press a key between two commits, so this has to flush
  // pending work without settling the passive update either.
  view.flushPendingWork();
  expect(probe(view.container)).toBe("committed");

  await view.settle();
  expect(probe(view.container)).toBe("settled");
});

test("leaves the act environment only for the flush itself", () => {
  const before = flags.IS_REACT_ACT_ENVIRONMENT;
  const view = renderOutsideAct(<div />);
  expect(flags.IS_REACT_ACT_ENVIRONMENT).toBe(before);

  view.commit(<PassiveUpdateProbe />);
  expect(flags.IS_REACT_ACT_ENVIRONMENT).toBe(before);

  // So a testing-library render in the same test still settles normally.
  const { container } = render(<PassiveUpdateProbe />);
  expect(probe(container)).toBe("settled");
});

test("cleanup unmounts every live root", () => {
  const first = renderOutsideAct(<div />);
  const second = renderOutsideAct(<div />);
  expect(document.body.contains(first.container)).toBe(true);

  cleanupOutsideAct();
  expect(document.body.contains(first.container)).toBe(false);
  expect(document.body.contains(second.container)).toBe(false);
});
