import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import {
  KnockoutBracket,
  type Round,
} from "@/components/motion/knockout-bracket";

afterEach(cleanup);

// A non-football, three-round draw: logos on one team, nothing on another, no
// dates, no `status`, and a custom result chip.
const ROUNDS: Round[] = [
  {
    name: "Quarter-finals",
    matches: [1, 2, 3, 4].map((n) => ({
      id: `qf-${n}`,
      // Absolute URL: happy-dom fires an error event on a relative one, which
      // would drop the crest to its initials fallback.
      home: {
        team: { name: `Team A${n}`, logo: `https://cdn.test/a${n}.svg` },
        score: 2,
      },
      away: { team: { name: `Team B${n}` }, score: 1 },
      winner: "home" as const,
      badge: "BO3",
    })),
  },
  {
    name: "Semi-finals",
    matches: [1, 2].map((n) => ({
      id: `sf-${n}`,
      home: { team: { name: `Team A${2 * n - 1}` }, score: 3 },
      away: { team: { name: `Team A${2 * n}` }, score: 0 },
      winner: "home" as const,
    })),
  },
  {
    name: "Grand final",
    matches: [
      {
        id: "gf-1",
        home: { team: null, score: null },
        away: { team: null, score: null },
      },
    ],
  },
];

describe("KnockoutBracket", () => {
  test("renders an arbitrary draw with logos, initials and custom labels", () => {
    const { getByLabelText, container } = render(
      <KnockoutBracket
        rounds={ROUNDS}
        initialRound={0}
        thirdPlaceLabel="Bronze match"
        thirdPlace={{
          id: "bronze",
          home: { team: { name: "Team A2" }, score: null },
          away: { team: { name: "Team A4" }, score: null },
        }}
      />,
    );

    getByLabelText("Bronze match");
    getByLabelText("Quarter-finals");
    // Teams with a `logo` load it; teams without any artwork fall back to initials.
    expect(container.querySelectorAll("img")).toHaveLength(4);
    expect(container.textContent).toContain("TA");
    // Per-match badge replaces the derived "FT" chip.
    expect(container.textContent).toContain("BO3");

    // Every card lands at a real offset — the layout math never yields NaN.
    for (const card of container.querySelectorAll<HTMLElement>("li")) {
      expect(card.style.transform ?? "").not.toContain("NaN");
    }
  });
});
