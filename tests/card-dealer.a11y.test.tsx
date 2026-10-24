import { afterEach, expect, test } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { CardDealer } from "@/components/motion/card-dealer";

afterEach(cleanup);

const CARDS = [
  { id: "a", zone: "deck" as const, label: "Ace of spades" },
  { id: "b", zone: "hand" as const, label: "Two of hearts" },
  { id: "c", zone: "hand" as const, label: "Three of clubs" },
  { id: "d", zone: "pile" as const, label: "Four of diamonds" },
];

test("card table names its region and exposes hand cards as named buttons in fan order", async () => {
  const { container, getByRole, getAllByRole } = render(
    <CardDealer
      cards={CARDS}
      renderFace={(card) => <span>{card.label}</span>}
      onCardSelect={() => {}}
      aria-label="Card table"
    />,
  );
  // The table renders cards once it has measured itself.
  await act(async () => {});
  expect(getByRole("region", { name: "Card table" })).toBeTruthy();
  const buttons = getAllByRole("button");
  expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
    "Two of hearts",
    "Three of clubs",
  ]);
  expect((await axe(container)).violations).toEqual([]);
});
