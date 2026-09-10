/* biome-ignore-all lint/performance/noImgElement: framework-independent registry example with explicitly sized images. */
"use client";

import { useState } from "react";
import { PredictionMarketCard } from "@/components/motion/prediction-market-card";
import { Button } from "@/components/motion/button";

// Native images keep this copy-paste example usable outside Next.js.
const markets = [
	{
		id: "basketball",
		title: "Boston Celtics vs. Los Angeles Lakers",
		category: "Basketball",
		status: "Sunday · 7:30 PM",
		volume: "$2.4M",
		live: false,
		image: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
		history: [12, 18, 15, 26, 20, 32, 29, 38, 34, 48, 43, 58],
		outcomes: [
			{
				id: "boston",
				label: "Celtics",
				probability: 0.51,
				next: 0.56,
				color: "#34d399",
				image: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
			},
			{
				id: "lakers",
				label: "Lakers",
				probability: 0.49,
				next: 0.44,
				color: "#fbbf24",
				image: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
			},
		],
	},
	{
		id: "baseball",
		title: "Tampa Bay Rays vs. Atlanta Braves",
		category: "MLB",
		status: "Mid 6th",
		volume: "$458K",
		live: true,
		image: "https://a.espncdn.com/i/teamlogos/mlb/500/tb.png",
		history: [8, 12, 10, 19, 15, 28, 23, 34, 30, 40, 36, 45],
		outcomes: [
			{
				id: "rays",
				label: "Rays",
				probability: 0.46,
				next: 0.52,
				color: "#60a5fa",
				image: "https://a.espncdn.com/i/teamlogos/mlb/500/tb.png",
			},
			{
				id: "braves",
				label: "Braves",
				probability: 0.54,
				next: 0.48,
				color: "#fb7185",
				image: "https://a.espncdn.com/i/teamlogos/mlb/500/atl.png",
			},
		],
	},
	{
		id: "rates",
		title: "Where will interest rates land by the end of the year?",
		category: "Economics",
		status: "Dec 31",
		volume: "$347K",
		live: false,
		image:
			"https://upload.wikimedia.org/wikipedia/commons/7/73/Seal_of_the_United_States_Federal_Reserve_Board.svg",
		history: [15, 11, 17, 14, 24, 21, 30, 25, 32, 29, 39, 42],
		outcomes: [
			{
				id: "below",
				label: "Below 3.5%",
				probability: 0.68,
				next: 0.72,
				color: "#34d399",
				image: null,
			},
			{
				id: "above",
				label: "Above 4.0%",
				probability: 0.23,
				next: 0.18,
				color: "#60a5fa",
				image: null,
			},
		],
	},
];

export function PredictionMarketCardPreview() {
	const [updated, setUpdated] = useState(false);
	const [saved, setSaved] = useState<Record<string, boolean>>({});

	return (
		<div className="@container w-full max-w-3xl space-y-5">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-sm font-medium">On the radar</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Demo markets · simulated prices
					</p>
				</div>
				<Button
					variant="secondary"
					size="sm"
					className="shrink-0"
					onClick={() => setUpdated((value) => !value)}
				>
					Update odds
				</Button>
			</div>
			<div className="grid auto-rows-fr gap-4 @min-[640px]:grid-cols-2">
				{markets.map((market) => (
					<PredictionMarketCard
						key={market.id}
						title={market.title}
						category={market.category}
						status={market.status}
						live={market.live}
						icon={
							<img
								src={market.image}
								alt=""
								width={48}
								height={48}
								className={
									market.id === "rates"
										? "size-full bg-white object-contain p-1"
										: "size-full object-contain p-1"
								}
							/>
						}
						volume={market.volume}
						volumeHistory={market.history}
						bookmarked={saved[market.id] ?? false}
						onBookmarkChange={(value) =>
							setSaved((current) => ({ ...current, [market.id]: value }))
						}
						outcomes={market.outcomes.map((outcome) => ({
							...outcome,
							probability: updated ? outcome.next : outcome.probability,
							icon: outcome.image ? (
								<img
									src={outcome.image}
									alt=""
									width={32}
									height={32}
									className="size-full object-contain p-0.5"
								/>
							) : undefined,
						}))}
					/>
				))}
			</div>
		</div>
	);
}
