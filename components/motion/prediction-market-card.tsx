"use client";

import { Bookmark, Check, TrendingUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useState } from "react";
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { NumberTicker } from "./number-ticker";

export interface PredictionMarketCardOutcome {
	id: string;
	label: string;
	/** Probability between 0 and 1. */
	probability: number;
	icon?: ReactNode;
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
	/** A scheduled time or live match status. */
	status?: string;
	live?: boolean;
	outcomes: PredictionMarketCardOutcome[];
	/** Binary rows show Yes/No per outcome; choices show one button per outcome. */
	variant?: "binary" | "choices";
	value?: PredictionMarketCardSelection | null;
	defaultValue?: PredictionMarketCardSelection | null;
	onValueChange?: (value: PredictionMarketCardSelection) => void;
	bookmarked?: boolean;
	defaultBookmarked?: boolean;
	onBookmarkChange?: (bookmarked: boolean) => void;
	className?: string;
}

function probability(value: number) {
	return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

/** A listing surface: selecting an outcome does not place an order. */
export function PredictionMarketCard({
	title,
	icon,
	category,
	volume,
	status,
	live = false,
	outcomes,
	variant = "binary",
	value,
	defaultValue = null,
	onValueChange,
	bookmarked,
	defaultBookmarked = false,
	onBookmarkChange,
	className,
}: PredictionMarketCardProps) {
	const titleId = useId();
	const reduce = useReducedMotion();
	const [internalValue, setInternalValue] = useState(defaultValue);
	const [internalBookmark, setInternalBookmark] = useState(defaultBookmarked);
	const selection = value === undefined ? internalValue : value;
	const saved = bookmarked ?? internalBookmark;
	const selectedOutcome = outcomes.find(
		(outcome) => outcome.id === selection?.outcomeId,
	);
	const selectedPrice = selectedOutcome
		? probability(
				selection?.side === "no"
					? 1 - selectedOutcome.probability
					: selectedOutcome.probability,
			)
		: 0;

	function select(outcomeId: string, side: "yes" | "no") {
		const next = { outcomeId, side };
		if (value === undefined) setInternalValue(next);
		onValueChange?.(next);
	}

	function choice(
		outcome: PredictionMarketCardOutcome,
		side: "yes" | "no",
		label: string,
	) {
		const active =
			selection?.outcomeId === outcome.id && selection.side === side;
		return (
			<motion.button
				key={`${outcome.id}-${side}`}
				type="button"
				aria-label={`${outcome.label}: ${label}`}
				aria-pressed={active}
				onClick={() => select(outcome.id, side)}
				whileTap={reduce ? undefined : { scale: 0.96 }}
				transition={SPRING_PRESS}
				className={cn(
					"relative flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
					side === "no"
						? "bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400"
						: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400",
					active && "ring-1 ring-inset ring-current",
				)}
			>
				<AnimatePresence initial={false}>
					{active && (
						<motion.span
							initial={{ opacity: 0, scale: reduce ? 1 : 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, transition: { duration: 0.1 } }}
							transition={SPRING_SWAP}
							className="shrink-0"
						>
							<Check aria-hidden className="size-3.5" />
						</motion.span>
					)}
				</AnimatePresence>
				<span className="truncate">{label}</span>
			</motion.button>
		);
	}

	return (
		<article
			aria-labelledby={titleId}
			className={cn(
				"flex w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 text-card-foreground",
				className,
			)}
		>
			<header className="mb-5 flex items-start gap-3">
				{icon && (
					<div
						aria-hidden
						className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-foreground"
					>
						{icon}
					</div>
				)}
				<div className="min-w-0 flex-1">
					{category && (
						<p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
							{category}
						</p>
					)}
					<h3
						id={titleId}
						className="text-base font-semibold leading-snug tracking-tight"
					>
						{title}
					</h3>
				</div>
			</header>

			<div className="space-y-4">
				{outcomes.map((outcome) => (
					<div key={outcome.id} className="space-y-2.5">
						<div className="flex items-center gap-3">
							{outcome.icon && (
								<span
									aria-hidden
									className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted"
								>
									{outcome.icon}
								</span>
							)}
							<span className="min-w-0 flex-1 text-sm font-medium">
								{outcome.label}
							</span>
							<NumberTicker
								value={Math.round(probability(outcome.probability) * 100)}
								startOnView={false}
								duration={0.25}
								stagger={0}
								format={(n) => `${n}%`}
								className="shrink-0 text-xl font-semibold tracking-tight tabular-nums"
							/>
							{variant === "binary" && (
								<div className="flex shrink-0 gap-1.5">
									{choice(outcome, "yes", "Yes")}
									{choice(outcome, "no", "No")}
								</div>
							)}
						</div>
						<div
							aria-hidden
							className="h-1 overflow-hidden rounded-full bg-foreground/5"
						>
							<motion.div
								initial={false}
								animate={{ scaleX: probability(outcome.probability) }}
								transition={
									reduce ? { duration: 0 } : { duration: 0.25, ease: EASE_OUT }
								}
								className="h-full origin-left rounded-full bg-foreground/25"
							/>
						</div>
					</div>
				))}
			</div>

			{variant === "choices" && (
				<div className="mt-4 flex flex-wrap gap-2">
					{outcomes.map((outcome) => choice(outcome, "yes", outcome.label))}
				</div>
			)}

			<div
				className="mt-4 flex min-h-6 items-center text-xs"
				aria-live="polite"
				aria-atomic="true"
			>
				<AnimatePresence initial={false} mode="wait">
					<motion.p
						key={
							selectedOutcome
								? `${selectedOutcome.id}-${selection?.side}`
								: "empty"
						}
						initial={{ opacity: 0, y: reduce ? 0 : 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{
							opacity: 0,
							y: reduce ? 0 : -3,
							transition: { duration: 0.08 },
						}}
						transition={{ duration: 0.16, ease: EASE_OUT }}
						className={
							selectedOutcome ? "text-foreground" : "text-muted-foreground"
						}
					>
						{selectedOutcome
							? `${selectedOutcome.label} · ${selection?.side === "no" ? "No" : "Yes"} at ${Math.round(selectedPrice * 100)}¢`
							: "Select an outcome"}
					</motion.p>
				</AnimatePresence>
			</div>

			<footer className="mt-auto flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
				<TrendingUp aria-hidden className="size-3.5 shrink-0" />
				<span className="shrink-0">{volume} vol.</span>
				{status && (
					<span
						className={cn(
							"ml-1 flex min-w-0 items-center gap-1.5",
							live && "text-rose-600 dark:text-rose-400",
						)}
					>
						{live && (
							<span
								aria-hidden
								className="size-1.5 shrink-0 rounded-full bg-current"
							/>
						)}
						<span className="truncate">{status}</span>
					</span>
				)}
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
		</article>
	);
}
