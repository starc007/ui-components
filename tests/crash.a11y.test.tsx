import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { StrictMode } from "react";
import { Crash } from "@/components/motion/crash";
import { CrashBalloon } from "@/components/motion/crash/crash-balloon";
import { CrashTower } from "@/components/motion/crash/crash-tower";

afterEach(cleanup);

// The Auto menu has its own live region; the game's is last.
const announcement = (container: HTMLElement) =>
  [...container.querySelectorAll("[aria-live='polite']")].at(-1)?.textContent;

// Every design shares one game and shell, so each gets the same checks.
const DESIGNS = { Crash, CrashBalloon, CrashTower };

for (const [name, Design] of Object.entries(DESIGNS)) {
  describe(name, () => {
    test("is a labelled region with one main button and named controls", async () => {
      const { container, getByRole } = render(<Design />);
      expect(getByRole("region", { name: "Crash" })).toBeTruthy();
      expect(getByRole("list", { name: "Recent crashes" })).toBeTruthy();
      expect(getByRole("button", { name: "Sound" }).getAttribute("aria-pressed")).toBe("false");
      expect(getByRole("button", { name: "Start" })).toBeTruthy();
      expect((await axe(container)).violations).toEqual([]);
    });

    test("a running round keeps focus on the main button and announces the crash", async () => {
      // StrictMode, as the site runs in development: its double mount must
      // not leave Start dead.
      const { container, getByRole } = render(
        <StrictMode>
          <Design getCrashPoint={() => 1.1} />
        </StrictMode>,
      );
      const main = getByRole("button", { name: "Start" });
      main.focus();
      // Synchronous act: an async one would wait out the whole flight.
      act(() => {
        fireEvent.click(main);
      });
      expect(main.textContent).toMatch(/^Cash out/);
      expect(document.activeElement).toBe(main);
      expect(announcement(container)).toBe("Round started.");
      expect((await axe(container)).violations).toEqual([]);

      // 1.10× is reached in about 0.8s.
      await waitFor(() => expect(announcement(container)).toBe("Crashed at 1.10×. The round is lost."), {
        timeout: 2000,
      });
      expect(main.textContent).toBe("Play again");
      expect(document.activeElement).toBe(main);
      expect(getByRole("list", { name: "Recent crashes" }).textContent).toContain("1.10×");
      // The receipt rises once the crash has played, and focus stays on Play again.
      const result = await waitFor(() => getByRole("group", { name: "Round result" }));
      expect(result.textContent).toContain("Crashed at1.10×");
      expect(getByRole("button", { name: "Hide result and show the flight" })).toBeTruthy();
      expect(document.activeElement).toBe(main);
      expect((await axe(container)).violations).toEqual([]);

      // Waits inside act, as the Mines test does: polling with waitFor while
      // the exit animates crashes Bun's test runner.
      await act(async () => {
        fireEvent.keyDown(main, { key: "Escape" });
        await new Promise((resolve) => setTimeout(resolve, 300));
      });
      expect(container.querySelector("[aria-label='Round result']")).toBeNull();
      expect(document.activeElement).toBe(main);
    });

    test("auto cash out announces the payout before the crash", async () => {
      const { container, getByRole } = render(<Design getCrashPoint={() => 2} defaultAutoCashOut={1.05} />);
      act(() => {
        fireEvent.click(getByRole("button", { name: "Start" }));
      });
      await waitFor(() => expect(announcement(container)).toBe("Cashed out at 1.05×."), { timeout: 2000 });
      expect(getByRole("button", { name: "Skip to crash" })).toBeTruthy();
      expect((await axe(container)).violations).toEqual([]);
    });
  });
}

test("a crash point from a Promise holds the main button busy until it settles", async () => {
  const { container, getByRole } = render(
    <Crash getCrashPoint={() => new Promise<number>((resolve) => setTimeout(() => resolve(1.05), 50))} />,
  );
  const main = getByRole("button", { name: "Start" });
  main.focus();
  act(() => {
    fireEvent.click(main);
  });
  expect(main.textContent).toBe("Starting…");
  expect(main.getAttribute("aria-busy")).toBe("true");
  expect(main.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(main);
  expect(announcement(container)).toBe("Starting round.");
  expect((await axe(container)).violations).toEqual([]);
  await waitFor(() => expect(announcement(container)).toBe("Crashed at 1.05×. The round is lost."), { timeout: 2000 });
});

test("a live round waits for the server's crash point and announces it", async () => {
  let round = 0;
  const onStart = (value: number) => {
    round = value;
  };
  const { container, getByRole, rerender } = render(<Crash crashAt={null} onStart={onStart} />);
  const main = getByRole("button", { name: "Start" });
  act(() => {
    fireEvent.click(main);
  });
  // Presses in the first 0.4s are taken as a double tap on Start; 1.05× comes after.
  await waitFor(() => expect(main.textContent).toMatch(/^Cash out 1\.(0[5-9]|[1-9])/), { timeout: 2000 });
  act(() => {
    fireEvent.click(main);
  });
  // Cashed out, but the crash point isn't known yet, so there is nothing to skip to.
  expect(main.textContent).toBe("Waiting for crash");
  expect(main.getAttribute("aria-disabled")).toBe("true");
  expect((await axe(container)).violations).toEqual([]);
  rerender(<Crash crashAt={{ round, value: 1 }} onStart={onStart} />);
  // Revealed behind the plane: it crashes at once, at the server's value,
  // and a cash out above it never happened.
  await waitFor(() => expect(announcement(container)).toBe("Crashed at 1.00×. The round is lost."), { timeout: 2000 });
});
