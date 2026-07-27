import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  KnockoutWheel,
  ROUNDS,
} from "@/components/motion/knockout-wheel";

afterEach(cleanup);

describe("KnockoutWheel", () => {
  test("uses one tab stop and follows the wheel hierarchy with arrow keys", () => {
    const { getAllByRole } = render(<KnockoutWheel rounds={ROUNDS} />);
    const nodes = getAllByRole("button");
    const hub = nodes[0];
    const firstFeeder = nodes[1];
    const secondFeeder = nodes[2];

    expect(nodes.filter((node) => node.tabIndex === 0)).toEqual([hub]);

    fireEvent.focus(hub);
    fireEvent.keyDown(hub, { key: "ArrowDown" });
    expect(document.activeElement).toBe(firstFeeder);

    fireEvent.keyDown(firstFeeder, { key: "ArrowRight" });
    expect(document.activeElement).toBe(secondFeeder);

    fireEvent.keyDown(secondFeeder, { key: "ArrowUp" });
    expect(document.activeElement).toBe(hub);
  });

  test("restores the champion path when the focused node leaves the visible rounds", async () => {
    const { container, getAllByRole, rerender } = render(
      <KnockoutWheel rounds={ROUNDS} />,
    );
    const rimNode = getAllByRole("button").at(-1);
    if (!rimNode) throw new Error("Expected a rim node");

    fireEvent.focus(rimNode);
    await waitFor(() => {
      expect(container.querySelectorAll(".stroke-foreground")).toHaveLength(1);
    });

    rerender(<KnockoutWheel rounds={ROUNDS} initialRound={1} />);
    await waitFor(() => {
      expect(
        container.querySelectorAll(".stroke-foreground").length,
      ).toBeGreaterThan(1);
    });
  });
});
