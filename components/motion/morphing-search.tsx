"use client";

import { type LucideIcon, Search } from "lucide-react";
import {
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
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

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

// Conceal only the unstable first frames of the shared-layout projection.
const CARET_REVEAL_DELAY_MS = 100;
const INPUT_TEXT_REVEAL_DELAY_MS = 250;

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
	const [activeIndex, setActiveIndex] = useState(0);
	const [caretVisible, setCaretVisible] = useState(true);
	const [inputTextVisible, setInputTextVisible] = useState(true);
	const [mounted, setMounted] = useState(false);
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
		setCaretVisible(Boolean(reduce));
		setInputTextVisible(Boolean(reduce));
		previousFocusRef.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		setOpen(true);
	}, [measureAnchor, reduce, setOpen]);

	const updateQuery = useCallback(
		(next: string) => {
			setQuery(next);
			setActiveIndex(0);
			onQueryChange?.(next);
		},
		[onQueryChange],
	);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		measureAnchor();
		const anchor = anchorRef.current;
		const observer =
			anchor && typeof ResizeObserver !== "undefined"
				? new ResizeObserver(measureAnchor)
				: null;
		if (anchor) observer?.observe(anchor);
		window.addEventListener("resize", measureAnchor);
		window.addEventListener("scroll", measureAnchor, { passive: true });
		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", measureAnchor);
			window.removeEventListener("scroll", measureAnchor);
		};
	}, [measureAnchor]);

	useEffect(() => {
		const handleShortcut = (event: KeyboardEvent) => {
			if (event.key === "Escape" && open) {
				event.preventDefault();
				setOpen(false);
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
	}, [open, openSearch, setOpen, shortcut]);

	useEffect(() => {
		if (open) {
			const opening = !wasOpenRef.current;
			if (opening) {
				setCaretVisible(Boolean(reduce));
				setInputTextVisible(Boolean(reduce));
			}
			updateQuery("");
			const frame = requestAnimationFrame(() => inputRef.current?.focus());
			const caretTimer =
				opening && !reduce
					? window.setTimeout(
							() => setCaretVisible(true),
							CARET_REVEAL_DELAY_MS,
						)
					: undefined;
			const inputTextTimer =
				opening && !reduce
					? window.setTimeout(
							() => setInputTextVisible(true),
							INPUT_TEXT_REVEAL_DELAY_MS,
						)
					: undefined;
			return () => {
				cancelAnimationFrame(frame);
				if (caretTimer !== undefined) window.clearTimeout(caretTimer);
				if (inputTextTimer !== undefined) window.clearTimeout(inputTextTimer);
			};
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
	}, [open, reduce, updateQuery]);

	useEffect(() => {
		wasOpenRef.current = open;
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const root = document.documentElement;
		const body = document.body;
		const rootOverflow = root.style.overflow;
		const bodyOverflow = body.style.overflow;
		root.style.overflow = "hidden";
		body.style.overflow = "hidden";
		return () => {
			root.style.overflow = rootOverflow;
			body.style.overflow = bodyOverflow;
		};
	}, [open]);

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

	useEffect(() => {
		if (activeIndex < filteredItems.length) return;
		setActiveIndex(Math.max(0, filteredItems.length - 1));
	}, [activeIndex, filteredItems.length]);

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
			setOpen(false);
		},
		[onSelect, setOpen],
	);

	const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			if (filteredItems.length === 0) return;
			setActiveIndex((current) =>
				Math.min(current + 1, filteredItems.length - 1),
			);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((current) => Math.max(current - 1, 0));
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
	const iconLayoutId = `${uid}-icon`;
	const labelLayoutId = `${uid}-label`;
	const shortcutLayoutId = `${uid}-shortcut`;
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

	const overlay = mounted
		? createPortal(
				<div
					aria-hidden={!open}
					inert={!open}
					className={cn(
						"fixed inset-0 z-50",
						open ? "pointer-events-auto" : "pointer-events-none",
					)}
				>
					{open ? (
						<motion.div key="morphing-search-overlay" className="fixed inset-0">
							<button
								type="button"
								aria-label="Close search"
								className="absolute inset-0 cursor-default bg-transparent"
								onClick={() => setOpen(false)}
							/>

							<motion.div
								ref={dialogRef}
								layoutId={shellLayoutId}
								role="dialog"
								aria-modal="true"
								aria-label="Search"
								onKeyDown={handleDialogKeyDown}
								className="fixed z-10 overflow-hidden rounded-xl bg-background/90 backdrop-blur-xl"
								style={{
									top: anchorRect.top,
									left: anchorRect.left,
									width: panelWidth,
									boxShadow: "inset 0 0 0 1px var(--color-border)",
								}}
								transition={{ layout: transition }}
							>
								<div className="flex h-12 items-center gap-2.5 border-b border-border px-3.5">
									<motion.span layoutId={iconLayoutId} className="shrink-0">
										<Search className="size-4 text-muted-foreground" />
									</motion.span>
									<div className="relative flex h-10 min-w-0 flex-1 items-center">
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
											style={{
												color: inputTextVisible ? undefined : "transparent",
												caretColor: caretVisible
													? "var(--color-foreground)"
													: "transparent",
											}}
											className="size-full bg-transparent text-sm text-foreground outline-none"
										/>
										<motion.span
											layoutId={labelLayoutId}
											aria-hidden="true"
											className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center truncate text-sm text-muted-foreground"
										>
											<span
												style={{ visibility: query ? "hidden" : "visible" }}
											>
												{placeholder}
											</span>
										</motion.span>
									</div>
									<motion.kbd
										layoutId={shortcutLayoutId}
										className="flex h-7 shrink-0 items-center rounded-md border border-border px-2 text-xs text-muted-foreground"
									>
										Esc
									</motion.kbd>
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
													initial: {
														opacity: 0,
														transform: "translateY(6px)",
													},
													open: {
														opacity: 1,
														transform: "translateY(0px)",
														transition: {
															duration: 0.16,
															delay: 0.06,
															ease: EASE_OUT,
														},
													},
												}
									}
									initial={
										reduce
											? { opacity: 1, transform: "translateY(0px)" }
											: "initial"
									}
									animate={
										reduce
											? { opacity: 1, transform: "translateY(0px)" }
											: "open"
									}
									className="overflow-y-auto p-2"
									style={{ maxHeight: resultsHeight }}
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
													onMouseMove={() => setActiveIndex(index)}
													onFocus={() => setActiveIndex(index)}
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
				</div>,
				document.body,
			)
		: null;

	return (
		<LayoutGroup id={uid}>
			<div ref={anchorRef} className={cn("h-12 w-72 max-w-full", className)}>
				{!open ? (
					<motion.button
						ref={triggerRef}
						key="morphing-search-trigger"
						layoutId={shellLayoutId}
						type="button"
						aria-haspopup="dialog"
						aria-expanded="false"
						onClick={openSearch}
						whileTap={reduce ? undefined : { scale: 0.985 }}
						transition={{ layout: transition, ...SPRING_PRESS }}
						style={{
							boxShadow: "inset 0 0 0 1px var(--search-trigger-stroke)",
						}}
						className="flex size-full cursor-text items-center gap-2.5 rounded-xl bg-background/60 px-3.5 text-left backdrop-blur-md outline-none [--search-trigger-stroke:var(--color-border)] hover:[--search-trigger-stroke:var(--color-border-strong)] focus-visible:ring-2 focus-visible:ring-ring"
					>
						<motion.span layoutId={iconLayoutId} className="shrink-0">
							<Search className="size-4 text-muted-foreground" />
						</motion.span>
						<span className="flex h-10 min-w-0 flex-1 items-center truncate text-sm text-muted-foreground">
							<motion.span
								layoutId={labelLayoutId}
								className="flex h-10 items-center truncate"
							>
								{placeholder}
							</motion.span>
						</span>
						{shortcut ? (
							<motion.kbd
								layoutId={shortcutLayoutId}
								className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border border-border px-2 text-xs text-muted-foreground"
							>
								{shortcut.toUpperCase()}
							</motion.kbd>
						) : null}
					</motion.button>
				) : null}
			</div>
			{overlay}
		</LayoutGroup>
	);
}
