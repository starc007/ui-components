"use client";

import { Landmark, Trophy } from "lucide-react";
import { useState } from "react";
import { PredictionMarketCard } from "@/components/motion/prediction-market-card";
import { Button } from "@/components/motion/button";

export function PredictionMarketCardPreview() {
	const [updated, setUpdated] = useState(false);

	return (
		<div className="@container w-full max-w-3xl space-y-5">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-sm font-medium">On the radar</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Demo markets · select an outcome or save a card
					</p>
				</div>
				<Button
					variant="secondary"
					size="sm"
					onClick={() => setUpdated((value) => !value)}
				>
					Update odds
				</Button>
			</div>
			<div className="grid gap-4 @min-[640px]:grid-cols-2">
				<PredictionMarketCard
					title="Who takes the championship?"
					category="Tennis · Tournament winner"
					icon={<Trophy className="size-5" />}
					volume="$2.4M"
					status="Finals · Sunday"
					outcomes={[
						{
							id: "alex",
							label: "Alex Morgan",
							probability: updated ? 0.56 : 0.51,
						},
						{
							id: "ben",
							label: "Ben Carter",
							probability: updated ? 0.31 : 0.36,
						},
					]}
				/>
				<PredictionMarketCard
					title="Northside vs. Westfield"
					category="Football · Match winner"
					icon={<Trophy className="size-5" />}
					variant="choices"
					volume="$458K"
					status="Live · 64′"
					live
					outcomes={[
						{
							id: "north",
							label: "Northside",
							probability: updated ? 0.64 : 0.56,
						},
						{ id: "draw", label: "Draw", probability: updated ? 0.22 : 0.24 },
						{
							id: "west",
							label: "Westfield",
							probability: updated ? 0.14 : 0.2,
						},
					]}
				/>
				<PredictionMarketCard
					title="Where will rates land this year?"
					category="Economics · Year-end forecast"
					icon={<Landmark className="size-5" />}
					volume="$347K"
					status="Dec 31"
					className="@min-[640px]:col-span-2"
					outcomes={[
						{
							id: "below",
							label: "Below 3.5%",
							probability: updated ? 0.72 : 0.68,
						},
						{
							id: "above",
							label: "Above 4.0%",
							probability: updated ? 0.18 : 0.23,
						},
					]}
				/>
			</div>
		</div>
	);
}
