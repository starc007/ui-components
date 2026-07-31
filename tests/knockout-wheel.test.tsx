import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  KnockoutWheel,
  type Round,
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

  test("draws a small logo-less draw with initials and a narrower stage", () => {
    const rounds: Round[] = [
      {
        name: "Semi-finals",
        matches: [1, 2].map((n) => ({
          id: `sf-${n}`,
          home: { team: { name: `Alpha ${n}` }, score: 2 },
          away: { team: { name: `Beta ${n}` }, score: 1 },
          winner: "home" as const,
        })),
      },
      {
        name: "Grand final",
        matches: [
          {
            id: "gf-1",
            home: { team: { name: "Alpha 1" }, score: 3 },
            away: { team: { name: "Alpha 2" }, score: 2 },
            winner: "home" as const,
          },
        ],
      },
    ];

    const { container, getByLabelText } = render(
      <KnockoutWheel rounds={rounds} />,
    );

    getByLabelText("Tournament wheel, won by Alpha 1");
    // No artwork anywhere, so every mark falls back to initials. The shallowest
    // draw has the smallest nodes, so it's where the size floor has to hold:
    // 15 units is ~10px once the 32rem stage scales the 760-unit box.
    const marks = [...container.querySelectorAll<SVGTextElement>("text")];
    expect(marks.length).toBeGreaterThan(0);
    expect(container.querySelectorAll("image")).toHaveLength(0);
    for (const mark of marks) {
      expect(Number(mark.getAttribute("font-size"))).toBeGreaterThanOrEqual(15);
    }
    // Node radius grows with depth, so a shallow draw has the *smallest* marks
    // and needs the stage floor most — it must not shrink with the draw.
    expect(container.firstElementChild?.firstElementChild?.className).toContain(
      "min-w-[32rem]",
    );
  });
});
