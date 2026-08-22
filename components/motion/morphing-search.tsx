"use client";

import { type LucideIcon, Search } from "lucide-react";
import {
	AnimatePresence,
	LayoutGroup,
	motion,
	type Transition,
	useReducedMotion,
} from "motion/react";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { useOnOpen } from "@/lib/hooks/use-on-open";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";
import { cn } from "@/lib/utils";

// Keeps the Wallet Card feel with a little more time to read the morph.
const SEARCH_MORPH: Transition = {
	type: "spring",
	duration: 0.58,
	bounce: 0.22,
};

// Keep the spring on the shell, but unfold complex clip-path values with the
// same progressive tween as Morph Popover so the content never snaps ahead.
const SEARCH_CLIP_TRANSITION: Transition = {
	duration: 0.32,
	ease: EASE_OUT,
};

export type MorphingSearchItem = {
	id: string;
	title: string;
	description?: string;
	keywords?: string[];
	icon?: LucideIcon;
	onSelect?: () => void;
};

export interface MorphingSearchProps {
	items: MorphingSearchItem[];
	placeholder?: string;
	shortcut?: string;
	/** Render the closed trigger as a compact search icon. */
	iconOnly?: boolean;
	emptyMessage?: string;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	onQueryChange?: (query: string) => void;
	onSelect?: (item: MorphingSearchItem) => void;
	className?: string;
}

type AnchorRect = {
	top: number;
	left: number;
	width: number;
};

function isEditableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false;
	return (
		target.isContentEditable ||
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target instanceof HTMLSelectElement
	);
}

export function MorphingSearch({
	items,
	placeholder = "Search",
	shortcut = "f",
	iconOnly = false,
	emptyMessage = "No results found.",
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	onQueryChange,
	onSelect,
	className,
}: MorphingSearchProps) {
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const [query, setQuery] = useState("");
	const [mounted, setMounted] = useState(false);
	const [backgroundScrollLocked, setBackgroundScrollLocked] =
		useState(defaultOpen);
	const [anchorRect, setAnchorRect] = useState<AnchorRect>({
		top: 16,
		left: 16,
		width: 288,
	});
	const open = controlledOpen ?? internalOpen;
	const controlled = controlledOpen !== undefined;
	const reduce = useReducedMotion();
	const uid = useId();
	const anchorRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);
	const wasOpenRef = useRef(open);
	const transition: Transition = reduce ? { duration: 0 } : SPRING_LAYOUT;
	const morphTransition: Transition = reduce ? { duration: 0 } : SEARCH_MORPH;

	const setOpen = useCallback(
		(next: boolean) => {
			if (!controlled) setInternalOpen(next);
			onOpenChange?.(next);
		},
		[controlled, onOpenChange],
	);

	const measureAnchor = useCallback(() => {
		const rect = anchorRef.current?.getBoundingClientRect();
		if (!rect || rect.width === 0) return;
		setAnchorRect({ top: rect.top, left: rect.left, width: rect.width });
	}, []);

	const openSearch = useCallback(() => {
		measureAnchor();
		setBackgroundScrollLocked(true);
		previousFocusRef.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		setOpen(true);
	}, [measureAnchor, setOpen]);

	const filteredItems = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return items;

		return items.filter((item) =>
			[item.title, item.description ?? "", ...(item.keywords ?? [])]
				.join(" ")
				.toLowerCase()
				.includes(needle),
		);
	}, [items, query]);

	const { activeIndex, moveTo, moveActive } = useRowCursor(filteredItems, query);

	// The cursor is stamped with the query, so changing it drops the highlight
	// without this having to say so.
	const updateQuery = useCallback(
		(next: string) => {
			setQuery(next);
			onQueryChange?.(next);
		},
		[onQueryChange],
	);

	const closeSearch = useCallback(() => {
		updateQuery("");
		setOpen(false);
	}, [setOpen, updateQuery]);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (open) setBackgroundScrollLocked(true);
	}, [open]);

	useEffect(() => {
		measureAnchor();
		const anchor = anchorRef.current;
		const observer =
			anchor && typeof ResizeObserver !== "undefined"
				? new ResizeObserver(measureAnchor)
				: null;
		if (anchor) observer?.observe(anchor);
		window.addEventListener("resize", measureAnchor);
		document.addEventListener("scroll", measureAnchor, true);
		window.visualViewport?.addEventListener("resize", measureAnchor);
		window.visualViewport?.addEventListener("scroll", measureAnchor);
		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", measureAnchor);
			document.removeEventListener("scroll", measureAnchor, true);
			window.visualViewport?.removeEventListener("resize", measureAnchor);
			window.visualViewport?.removeEventListener("scroll", measureAnchor);
		};
	}, [measureAnchor]);

	useEffect(() => {
		if (!backgroundScrollLocked) return;

		const preventBackgroundWheel = (event: WheelEvent) => {
			const target = event.target;
			if (target instanceof Node && listRef.current?.contains(target)) return;
			event.preventDefault();
		};
		const preventBackgroundTouch = (event: TouchEvent) => {
			const target = event.target;
			if (target instanceof Node && listRef.current?.contains(target)) return;
			event.preventDefault();
		};

		document.addEventListener("wheel", preventBackgroundWheel, {
			passive: false,
		});
		document.addEventListener("touchmove", preventBackgroundTouch, {
			passive: false,
		});
		return () => {
			document.removeEventListener("wheel", preventBackgroundWheel);
			document.removeEventListener("touchmove", preventBackgroundTouch);
		};
	}, [backgroundScrollLocked]);

	useEffect(() => {
		const handleShortcut = (event: KeyboardEvent) => {
			if (event.key === "Escape" && open) {
				event.preventDefault();
				closeSearch();
				return;
			}

			if (
				!open &&
				shortcut &&
				event.key.toLowerCase() === shortcut.toLowerCase() &&
				!event.repeat &&
				!event.metaKey &&
				!event.ctrlKey &&
				!event.altKey &&
				!event.shiftKey &&
				!isEditableTarget(event.target)
			) {
				event.preventDefault();
				openSearch();
			}
		};

		window.addEventListener("keydown", handleShortcut);
		return () => window.removeEventListener("keydown", handleShortcut);
	}, [closeSearch, open, openSearch, shortcut]);

	// Only this component's own state. Telling the consumer the query changed is
	// a side effect, so it waits for the effect below.
	useOnOpen(open, () => {
		setQuery("");
		moveTo(null);
	});

	// Keyed to `open` alone. `onQueryChange` is read through a ref because an
	// inline one changes identity on every keystroke, and this effect clearing
	// the field on every keystroke is exactly what that costs. Written after
	// commit for the reason `lib/hooks/use-row-cursor.ts` gives at length.
	const notifyQuery = useRef(onQueryChange);
	useLayoutEffect(() => {
		notifyQuery.current = onQueryChange;
	});

	useEffect(() => {
		if (open) {
			notifyQuery.current?.("");
			const frame = requestAnimationFrame(() => inputRef.current?.focus());
			return () => cancelAnimationFrame(frame);
		}

		if (wasOpenRef.current) {
			const frame = requestAnimationFrame(() => {
				const previousFocus = previousFocusRef.current;
				const focusTarget = previousFocus?.isConnected
					? previousFocus
					: triggerRef.current;
				focusTarget?.focus();
			});
			return () => cancelAnimationFrame(frame);
		}
	}, [open]);

	useEffect(() => {
		wasOpenRef.current = open;
	}, [open]);

	useEffect(() => {
		if (!open) return;
		listRef.current
			?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
			?.scrollIntoView({ block: "nearest" });
	}, [activeIndex, open]);

	const selectItem = useCallback(
		(item: MorphingSearchItem) => {
			item.onSelect?.();
			onSelect?.(item);
			closeSearch();
		},
		[closeSearch, onSelect],
	);

	const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			moveActive(1);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			moveActive(-1);
			return;
		}

		if (event.key === "Enter") {
			event.preventDefault();
			const item = filteredItems[activeIndex];
			if (item) selectItem(item);
			return;
		}

		if (event.key !== "Tab" || !dialogRef.current) return;
		const focusable = Array.from(
			dialogRef.current.querySelectorAll<HTMLElement>(
				'input, button:not([disabled]), [tabindex]:not([tabindex="-1"])',
			),
		);
		const first = focusable[0];
		const last = focusable.at(-1);
		if (!first || !last) return;

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	const shellLayoutId = `${uid}-shell`;
	const listboxId = `${uid}-results`;
	const panelWidth = mounted
		? Math.max(
				anchorRect.width,
				Math.min(448, window.innerWidth - anchorRect.left - 16),
			)
		: anchorRect.width;
	const resultsHeight = mounted
		? Math.max(96, Math.min(288, window.innerHeight - anchorRect.top - 80))
		: 288;
	const collapsedContentClip = `inset(0px ${Math.max(
		0,
		panelWidth - anchorRect.width,
	)}px ${resultsHeight}px 0px round 12px)`;
	const expandedContentClip = "inset(0px 0px 0px 0px round 12px)";

	// Neither grouping layer carries a box: they only hold `inert`/`aria-hidden`,
	// the z-index and the presence key, and every child below is `fixed` and
	// resolves against the viewport itself. The click catcher spans the viewport
	// edges but has no children and filters nothing, so it is not a sampling
	// layer either. See tests/fixed-overlay-edge-sampling.test.tsx.
	const overlay = mounted
		? createPortal(
				<div
					aria-hidden={!open}
					inert={!open}
					className="pointer-events-none fixed left-0 top-0 z-50 size-0"
				>
					<AnimatePresence
						initial={false}
						mode="popLayout"
						onExitComplete={() => setBackgroundScrollLocked(false)}
					>
						{open ? (
							<motion.div
								key="morphing-search-overlay"
								className="fixed left-0 top-0 size-0"
							>
								<button
									type="button"
									aria-label="Close search"
									className="pointer-events-auto fixed inset-0 cursor-default bg-transparent"
									onClick={closeSearch}
								/>

								<motion.div
									layoutId={shellLayoutId}
									aria-hidden="true"
									className="fixed z-10 rounded-xl bg-background/90 backdrop-blur-xl"
									style={{
										top: anchorRect.top,
										left: anchorRect.left,
										width: panelWidth,
										height: 48 + resultsHeight,
										boxShadow: "inset 0 0 0 1px var(--color-border)",
									}}
									transition={morphTransition}
								/>

								<motion.div
									ref={dialogRef}
									role="dialog"
									aria-modal="true"
									aria-label="Search"
									onKeyDown={handleDialogKeyDown}
									initial={
										reduce
											? false
											: { opacity: 0, clipPath: collapsedContentClip }
									}
									animate={{ opacity: 1, clipPath: expandedContentClip }}
									exit={{
										opacity: 0,
										clipPath: collapsedContentClip,
										transition: reduce
											? { duration: 0 }
											: {
													clipPath: SEARCH_CLIP_TRANSITION,
													opacity: SEARCH_MORPH,
												},
									}}
									transition={
										reduce
											? { duration: 0 }
											: {
													clipPath: SEARCH_CLIP_TRANSITION,
													opacity: SEARCH_MORPH,
												}
									}
									className="pointer-events-auto fixed z-20 overflow-hidden rounded-xl"
									style={{
										top: anchorRect.top,
										left: anchorRect.left,
										width: panelWidth,
									}}
								>
									<div
										className={cn(
											"flex h-12 items-center gap-2.5 border-b border-border",
											iconOnly ? "px-4" : "px-3.5",
										)}
									>
										<span className="shrink-0">
											<Search className="size-4 text-muted-foreground" />
										</span>
										<div className="flex h-10 min-w-0 flex-1 items-center">
											<input
												ref={inputRef}
												value={query}
												onChange={(event) => updateQuery(event.target.value)}
												role="combobox"
												aria-label={placeholder}
												aria-expanded="true"
												aria-controls={listboxId}
												aria-autocomplete="list"
												aria-activedescendant={
													filteredItems.length > 0
														? `${uid}-option-${activeIndex}`
														: undefined
												}
												placeholder={placeholder}
												className="size-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
											/>
										</div>
										<kbd className="flex h-7 shrink-0 items-center rounded-md border border-border px-2 text-xs text-muted-foreground">
											Esc
										</kbd>
									</div>

									<motion.div
										ref={listRef}
										id={listboxId}
										role="listbox"
										aria-label="Search results"
										transition={reduce ? { duration: 0 } : undefined}
										variants={
											reduce
												? undefined
												: {
														closed: {
															opacity: 0,
															transform: "translateY(6px)",
															transition: {
																duration: 0.16,
																delay: 0.18,
																ease: EASE_OUT,
															},
														},
														open: {
															opacity: 1,
															transform: "translateY(0px)",
															transition: {
																duration: 0.16,
																ease: EASE_OUT,
															},
														},
													}
										}
										initial={
											reduce
												? { opacity: 1, transform: "translateY(0px)" }
												: "closed"
										}
										animate={
											reduce
												? { opacity: 1, transform: "translateY(0px)" }
												: "open"
										}
										exit={reduce ? undefined : "closed"}
										className="overscroll-contain overflow-y-auto p-2"
										style={{
											maxHeight: resultsHeight,
										}}
									>
										{filteredItems.length > 0 ? (
											filteredItems.map((item, index) => {
												const Icon = item.icon;
												const active = index === activeIndex;
												return (
													<button
														key={item.id}
														id={`${uid}-option-${index}`}
														type="button"
														role="option"
														aria-selected={active}
														data-index={index}
														onMouseMove={() => moveTo(item.id)}
														onFocus={() => moveTo(item.id)}
														onClick={() => selectItem(item)}
														className="relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
													>
														{active ? (
															<motion.span
																layoutId={`${uid}-active-result`}
																className="absolute inset-0 rounded-lg bg-foreground/5"
																transition={transition}
															/>
														) : null}
														{Icon ? (
															<Icon className="relative size-4 shrink-0 text-muted-foreground" />
														) : null}
														<span className="relative min-w-0">
															<span className="block truncate text-sm font-medium text-foreground">
																{item.title}
															</span>
															{item.description ? (
																<span className="block truncate text-xs text-muted-foreground">
																	{item.description}
																</span>
															) : null}
														</span>
													</button>
												);
											})
										) : (
											<p className="px-3 py-8 text-center text-sm text-muted-foreground">
												{emptyMessage}
											</p>
										)}
									</motion.div>
								</motion.div>
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>,
				document.body,
			)
		: null;

	return (
		<LayoutGroup id={uid}>
			<div
				ref={anchorRef}
				className={cn(
					"relative",
					iconOnly ? "size-12" : "h-12 w-72 max-w-full",
					className,
				)}
			>
				{!open ? (
					<motion.button
						ref={triggerRef}
						key="morphing-search-trigger"
						layoutId={shellLayoutId}
						type="button"
						aria-haspopup="dialog"
						aria-expanded="false"
						aria-label={placeholder}
						onClick={openSearch}
						transition={morphTransition}
						style={{
							boxShadow: "inset 0 0 0 1px var(--search-trigger-stroke)",
						}}
						className={cn(
							"flex size-full items-center rounded-xl bg-background/60 text-left backdrop-blur-md outline-none [--search-trigger-stroke:var(--color-border)] hover:[--search-trigger-stroke:var(--color-border-strong)] focus-visible:ring-2 focus-visible:ring-ring",
							iconOnly ? "cursor-pointer justify-center" : "cursor-text px-3.5",
						)}
					></motion.button>
				) : null}
				<motion.div
					aria-hidden="true"
					initial={false}
					animate={{ opacity: open ? 0 : 1 }}
					transition={
						reduce
							? { duration: 0 }
							: {
									duration: 0.1,
									delay: open ? 0.1 : 0.12,
									ease: EASE_OUT,
								}
					}
					className={cn(
						"pointer-events-none absolute inset-0 flex items-center",
						backgroundScrollLocked && "z-[60]",
						iconOnly ? "justify-center" : "gap-2.5 px-3.5",
					)}
				>
					<Search className="size-4 shrink-0 text-muted-foreground" />
					{iconOnly ? null : (
						<>
							<span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
								{placeholder}
							</span>
							{shortcut ? (
								<kbd className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border border-border px-2 text-xs text-muted-foreground">
									{shortcut.toUpperCase()}
								</kbd>
							) : null}
						</>
					)}
				</motion.div>
			</div>
			{overlay}
		</LayoutGroup>
	);
}
