"use client";

import { Bookmark } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useState } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { Tooltip } from "./tooltip";
import { NumberTicker } from "./number-ticker";

export interface PredictionMarketCardOutcome {
	id: string;
	label: string;
	/** Probability between 0 and 1. */
	probability: number;
	icon?: ReactNode;
	/** Optional team color for the compact probability line. */
	color?: string;
}

export interface PredictionMarketCardSelection {
	outcomeId: string;
	side: "yes" | "no";
}

export interface PredictionMarketCardProps {
	title: string;
	icon?: ReactNode;
	category?: string;
	volume: string;
	/** Chronological volume samples for the optional footer sparkline. */
	volumeHistory?: number[];
	/** A scheduled time or live match status. */
	status?: string;
	live?: boolean;
	outcomes: PredictionMarketCardOutcome[];
	/** Called on each outcome CTA click; the card keeps no selected state. */
	onOutcomeClick?: (value: PredictionMarketCardSelection) => void;
	bookmarked?: boolean;
	defaultBookmarked?: boolean;
	onBookmarkChange?: (bookmarked: boolean) => void;
	className?: string;
}

function probability(value: number) {
	return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

/** A listing surface with outcome CTAs and an independent bookmark toggle. */
export function PredictionMarketCard({
	title,
	icon,
	category,
	volume,
	volumeHistory,
	status,
	live = false,
	outcomes,
	onOutcomeClick,
	bookmarked,
	defaultBookmarked = false,
	onBookmarkChange,
	className,
}: PredictionMarketCardProps) {
	const titleId = useId();
	const chartId = useId();
	const samples = volumeHistory?.filter(Number.isFinite) ?? [];
	const low = Math.min(...samples);
	const range = Math.max(...samples) - low;
	const chartPoints =
		samples.length > 1
			? samples
					.map(
						(sample, index) =>
							`${2 + (index / (samples.length - 1)) * 44},${18 - (range ? (sample - low) / range : 0.5) * 14}`,
					)
					.join(" ")
			: null;
	const reduce = useReducedMotion();
	const [internalBookmark, setInternalBookmark] = useState(defaultBookmarked);
	const saved = bookmarked ?? internalBookmark;

	return (
		<article
			aria-labelledby={titleId}
			className={cn(
				"flex h-full w-full min-w-0 flex-col overflow-hidden rounded-3xl bg-card text-foreground",
				className,
			)}
		>
			<header className="flex shrink-0 items-center gap-3 px-4 py-3">
				{icon && (
					<div
						aria-hidden
						className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-foreground"
					>
						{icon}
					</div>
				)}
				<div className="min-w-0 flex-1">
					<h3
						id={titleId}
						className="break-words font-display text-base font-medium leading-snug tracking-tight"
					>
						{title}
					</h3>
					<p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
						{status && (
							<span
								className={cn(
									"inline-flex items-center gap-1.5",
									live && "text-rose-500",
								)}
							>
								{live && (
									<span
										aria-hidden
										className="size-1.5 rounded-full bg-current"
									/>
								)}
								{status}
							</span>
						)}
						{status && category && <span aria-hidden>·</span>}
						{category && <span>{category}</span>}
					</p>
				</div>
			</header>

			<div className="mx-2 mb-2 flex flex-1 flex-col rounded-3xl bg-background px-4 py-3">
				<div className="flex flex-1 flex-col justify-center gap-3">
					{outcomes.map((outcome, index) => (
						<div key={outcome.id} className="space-y-1">
							<div className="flex min-h-10 items-center gap-2">
								{outcome.icon && (
									<span
										aria-hidden
										className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted"
									>
										{outcome.icon}
									</span>
								)}
								<span className="min-w-0 flex-1 break-words text-sm font-medium">
									{outcome.label}
								</span>
								<Tooltip
									content="Potential payout per $1 if this outcome wins, including your stake. Before fees; based on the displayed price."
									wrapperClassName="shrink-0"
									className="w-44 whitespace-normal text-center leading-relaxed"
								>
									<button
										type="button"
										aria-label={`Potential payout for ${outcome.label}`}
										className="rounded-md py-2 text-sm tabular-nums text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
									>
										{probability(outcome.probability) > 0
											? `${(1 / probability(outcome.probability)).toFixed(1)}×`
											: "—"}
									</button>
								</Tooltip>
								<MarketOddsButton
									positive={index % 2 === 0}
									outcome={outcome}
									onClick={() =>
										onOutcomeClick?.({ outcomeId: outcome.id, side: "yes" })
									}
								/>
							</div>
							<div
								aria-hidden
								className="h-0.5 w-24 overflow-hidden rounded-full"
							>
								<motion.div
									initial={false}
									animate={{ scaleX: probability(outcome.probability) }}
									transition={
										reduce
											? { duration: 0 }
											: { duration: 0.25, ease: EASE_OUT }
									}
									className="h-full origin-left rounded-full bg-emerald-300/70 dark:bg-emerald-400/40"
									style={
										outcome.color
											? { backgroundColor: outcome.color }
											: undefined
									}
								/>
							</div>
						</div>
					))}
				</div>

				<footer className="mt-2 flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
					{chartPoints && (
						<svg
							aria-hidden="true"
							viewBox="0 0 48 22"
							className="h-5 w-12 shrink-0 text-emerald-500 dark:text-emerald-400"
							fill="none"
						>
							<defs>
								<linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="0%"
										stopColor="currentColor"
										stopOpacity="0.22"
									/>
									<stop
										offset="100%"
										stopColor="currentColor"
										stopOpacity="0"
									/>
								</linearGradient>
							</defs>
							<polygon
								points={`2,22 ${chartPoints} 46,22`}
								fill={`url(#${chartId})`}
							/>
							<polyline
								points={chartPoints}
								stroke="currentColor"
								strokeWidth="1.75"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
					<span className="shrink-0">{volume} vol.</span>
					<motion.button
						type="button"
						aria-label={`Bookmark ${title}`}
						aria-pressed={saved}
						onClick={() => {
							if (bookmarked === undefined) setInternalBookmark(!saved);
							onBookmarkChange?.(!saved);
						}}
						whileTap={reduce ? undefined : { scale: 0.85 }}
						transition={SPRING_PRESS}
						className={cn(
							"ml-auto flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
							saved && "text-foreground",
						)}
					>
						<motion.span
							animate={{ scale: saved && !reduce ? [1, 1.2, 1] : 1 }}
							transition={{ duration: 0.22, ease: EASE_OUT }}
						>
							<Bookmark
								aria-hidden
								className={cn("size-4", saved && "fill-current")}
							/>
						</motion.span>
					</motion.button>
				</footer>
			</div>
		</article>
	);
}

function MarketOddsButton({
	positive,
	outcome,
	onClick,
}: {
	outcome: PredictionMarketCardOutcome;
	positive: boolean;
	onClick: () => void;
}) {
	const reduce = useReducedMotion();
	const cents = Math.round(probability(outcome.probability) * 100);
	return (
		<motion.button
			type="button"
			aria-label={`Trade ${outcome.label} at ${cents}%`}
			onClick={onClick}
			whileTap={reduce ? undefined : { scale: 0.96 }}
			transition={SPRING_PRESS}
			className={cn(
				"relative flex min-h-10 min-w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-[0_3px_0] transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
				positive &&
					"shadow-emerald-500/20 border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400",
				!positive &&
					"shadow-rose-500/20 border-rose-500/25 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400",
			)}
		>
			<NumberTicker
				value={cents}
				startOnView={false}
				duration={0.25}
				stagger={0}
				suffix="%"
			/>
		</motion.button>
	);
}
