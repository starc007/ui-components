import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
	PredictionMarketCard,
	type PredictionMarketCardSelection,
} from "@/components/motion/prediction-market-card";

afterEach(cleanup);

const outcomes = [
	{ id: "a", label: "Northside", probability: 0.6 },
	{ id: "b", label: "Westfield", probability: 0.4 },
];

test("outcome CTAs do not toggle; bookmarks toggle independently", () => {
	const { getByRole } = render(
		<PredictionMarketCard title="Final" volume="$10K" outcomes={outcomes} />,
	);
	const yes = getByRole("button", { name: "Trade Northside at 60%" });
	const no = getByRole("button", { name: "Trade Westfield at 40%" });
	fireEvent.click(yes);
	expect(yes.getAttribute("aria-pressed")).toBeNull();
	fireEvent.click(no);
	expect(no.getAttribute("aria-pressed")).toBeNull();
	expect(yes.getAttribute("aria-pressed")).toBeNull();
	const bookmark = getByRole("button", { name: "Bookmark Final" });
	fireEvent.click(bookmark);
	expect(bookmark.getAttribute("aria-pressed")).toBe("true");
	fireEvent.click(bookmark);
	expect(bookmark.getAttribute("aria-pressed")).toBe("false");
	expect(no.getAttribute("aria-pressed")).toBeNull();
});

test("outcome CTAs emit actions; controlled bookmarks wait for the consumer", () => {
	const selections: PredictionMarketCardSelection[] = [];
	const bookmarks: boolean[] = [];
	const props = {
		title: "Final",
		volume: "$10K",
		outcomes,
		onOutcomeClick: (next: PredictionMarketCardSelection) =>
			selections.push(next),
		onBookmarkChange: (next: boolean) => bookmarks.push(next),
	};
	const { getByRole, rerender } = render(
		<PredictionMarketCard {...props} bookmarked={false} />,
	);
	fireEvent.click(getByRole("button", { name: "Trade Northside at 60%" }));
	fireEvent.click(getByRole("button", { name: "Bookmark Final" }));
	expect(selections).toEqual([{ outcomeId: "a", side: "yes" }]);
	expect(bookmarks).toEqual([true]);
	expect(
		getByRole("button", { name: "Trade Northside at 60%" }).getAttribute(
			"aria-pressed",
		),
	).toBeNull();
	expect(
		getByRole("button", { name: "Bookmark Final" }).getAttribute(
			"aria-pressed",
		),
	).toBe("false");
	rerender(<PredictionMarketCard {...props} bookmarked />);
	expect(
		getByRole("button", { name: "Trade Northside at 60%" }).getAttribute(
			"aria-pressed",
		),
	).toBeNull();
	expect(
		getByRole("button", { name: "Bookmark Final" }).getAttribute(
			"aria-pressed",
		),
	).toBe("true");
});

test("market titles are plain text and odds labels track updated prices", () => {
	const { getByRole, rerender } = render(
		<PredictionMarketCard
			title="Final"
			volume="$10K"
			outcomes={outcomes}
		/>,
	);
	expect(getByRole("heading", { name: "Final" }).querySelector("a, button")).toBeNull();
	rerender(
		<PredictionMarketCard
			title="Final"
			volume="$10K"
			outcomes={[{ ...outcomes[0], probability: 0.65 }]}
		/>,
	);
	expect(getByRole("button", { name: "Trade Northside at 65%" })).toBeTruthy();
	expect(
		getByRole("button", { name: "Potential payout for Northside" }),
	).toBeTruthy();
});
