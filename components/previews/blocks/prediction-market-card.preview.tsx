"use client";

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
						Demo markets · explore the odds or save a card
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
			<div className="grid auto-rows-fr gap-4 @min-[640px]:grid-cols-2">
				<PredictionMarketCard
					title="Who takes the championship?"
					category="Tennis · Tournament winner"
					icon={
						<img
							src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=160&h=160&q=85"
							alt=""
							width={48}
							height={48}
							className="size-full object-cover"
						/>
					}
					volume="$2.4M"
					volumeHistory={[12, 18, 15, 26, 20, 32, 29, 38, 34, 48, 43, 58]}
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
					category="Football"
					icon={
						<img
							src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=160&h=160&q=85"
							alt=""
							width={48}
							height={48}
							className="size-full object-cover"
						/>
					}
					volume="$458K"
					volumeHistory={[8, 12, 10, 19, 15, 28, 23, 34, 30, 40, 36, 45]}
					status="Live · 64′"
					live
					outcomes={[
						{
							id: "north",
							label: "Northside",
							probability: updated ? 0.64 : 0.56,
							color: "#60a5fa",
						},
						{
							id: "west",
							label: "Westfield",
							probability: updated ? 0.36 : 0.44,
							color: "#fb7185",
						},
					]}
				/>
				<PredictionMarketCard
					title="Where will rates land this year?"
					category="Economics · Year-end forecast"
					icon={
						<img
							src="https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?auto=format&fit=crop&w=160&h=160&q=85"
							alt=""
							width={48}
							height={48}
							className="size-full object-cover"
						/>
					}
					volume="$347K"
					volumeHistory={[15, 11, 17, 14, 24, 21, 30, 25, 32, 29, 39, 42]}
					status="Dec 31"
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
