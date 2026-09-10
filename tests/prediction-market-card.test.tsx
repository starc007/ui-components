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

test("selection stays exclusive across outcomes and sides; bookmarks toggle independently", () => {
	const { getByRole } = render(
		<PredictionMarketCard title="Final" volume="$10K" outcomes={outcomes} />,
	);
	const yes = getByRole("button", { name: "Northside: Yes" });
	const no = getByRole("button", { name: "Westfield: No" });
	fireEvent.click(yes);
	expect(yes.getAttribute("aria-pressed")).toBe("true");
	fireEvent.click(no);
	expect(no.getAttribute("aria-pressed")).toBe("true");
	expect(yes.getAttribute("aria-pressed")).toBe("false");
	const bookmark = getByRole("button", { name: "Bookmark Final" });
	fireEvent.click(bookmark);
	expect(bookmark.getAttribute("aria-pressed")).toBe("true");
	fireEvent.click(bookmark);
	expect(bookmark.getAttribute("aria-pressed")).toBe("false");
	expect(no.getAttribute("aria-pressed")).toBe("true");
});

test("controlled selection and bookmark wait for the consumer to accept changes", () => {
	const selections: PredictionMarketCardSelection[] = [];
	const bookmarks: boolean[] = [];
	const props = {
		title: "Final",
		volume: "$10K",
		outcomes,
		onValueChange: (next: PredictionMarketCardSelection) =>
			selections.push(next),
		onBookmarkChange: (next: boolean) => bookmarks.push(next),
	};
	const { getByRole, rerender } = render(
		<PredictionMarketCard
			{...props}
			variant="choices"
			value={null}
			bookmarked={false}
		/>,
	);
	fireEvent.click(getByRole("button", { name: "Northside: Northside" }));
	fireEvent.click(getByRole("button", { name: "Bookmark Final" }));
	expect(selections).toEqual([{ outcomeId: "a", side: "yes" }]);
	expect(bookmarks).toEqual([true]);
	expect(
		getByRole("button", { name: "Northside: Northside" }).getAttribute(
			"aria-pressed",
		),
	).toBe("false");
	expect(
		getByRole("button", { name: "Bookmark Final" }).getAttribute(
			"aria-pressed",
		),
	).toBe("false");
	rerender(
		<PredictionMarketCard
			{...props}
			variant="choices"
			value={selections[0]}
			bookmarked
		/>,
	);
	expect(
		getByRole("button", { name: "Northside: Northside" }).getAttribute(
			"aria-pressed",
		),
	).toBe("true");
	expect(
		getByRole("button", { name: "Bookmark Final" }).getAttribute(
			"aria-pressed",
		),
	).toBe("true");
});
