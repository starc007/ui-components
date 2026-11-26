"use client";

import { ChevronDown } from "lucide-react";
import {
  animate,
  type HTMLMotionProps,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  type ComponentPropsWithRef,
  cloneElement,
  createContext,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MessageSideContext } from "@/components/agents/message-context";
import { EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { mergeRefs } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";

export type MessageBubbleVariant =
  | "solid"
  | "soft"
  | "tint"
  | "outline"
  | "ghost"
  | "danger";
export type MessageBubbleAlign = "start" | "end";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const messageBubbleMessages = {
  showMore: "Show more",
  showLess: "Show less",
};

export type MessageBubbleMessages = typeof messageBubbleMessages;

interface MessageBubbleContextValue {
  align?: MessageBubbleAlign;
  animateIn: boolean;
  variant: MessageBubbleVariant;
  labels?: Partial<MessageBubbleMessages>;
}

const MessageBubbleContext = createContext<MessageBubbleContextValue>({
  animateIn: true,
  variant: "soft",
});

export interface MessageBubbleProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  /** Fill and border style of the bubble. Default: "soft" */
  variant?: MessageBubbleVariant;
  /** Defaults to the surrounding Message alignment when omitted. */
  align?: MessageBubbleAlign;
  /** Plays the bubble entrance once when this component mounts. */
  animateIn?: boolean;
  /** Override any built-in string. */
  labels?: Partial<MessageBubbleMessages>;
  children?: ReactNode;
}

export interface MessageBubbleContentProps
  extends ComponentPropsWithRef<"div"> {
  /** Replaces the content element while preserving bubble styling. */
  render?: ReactElement;
}

export interface MessageBubbleGroupProps extends ComponentPropsWithRef<"div"> {
  /** Gap between bubbles. Default: "compact" */
  spacing?: "compact" | "default";
}

export interface MessageBubbleCollapsibleProps
  extends ComponentPropsWithRef<"div"> {
  /** Whether the full text shows, for controlled use. */
  open?: boolean;
  /** Whether the full text shows at first when uncontrolled. Default: false */
  defaultOpen?: boolean;
  /** Called with the new state when the text expands or collapses. */
  onOpenChange?: (open: boolean) => void;
  /** Lines shown while collapsed. Default: 4 */
  collapsedLines?: 2 | 3 | 4 | 5 | 6;
  /** Text of the expand button. Default: "Show more" */
  moreLabel?: ReactNode;
  /** Text of the collapse button. Default: "Show less" */
  lessLabel?: ReactNode;
  /** Classes merged onto the clamped text wrapper. */
  contentClassName?: string;
  /** Classes merged onto the show more button. */
  triggerClassName?: string;
  children?: ReactNode;
}

const BUBBLE_CONTENT_REVEAL = {
  duration: 0.12,
  ease: EASE_OUT,
  delay: 0.04,
} as const;

// Expanded text wipes in top to bottom, quick enough to read straight on.
const REVEAL = { duration: 0.32, ease: EASE_OUT } as const;
// Clamped text stays solid to here (%), then fades out by the bottom.
const CLAMP_SOLID = 68;
// How soft the moving edge of the wipe is, in % of the text's height.
const WIPE_EDGE = 12;

// Sent bubbles should pop into place quickly with one restrained overshoot.
const BUBBLE_POP = {
  type: "spring",
  stiffness: 520,
  damping: 27,
  mass: 0.52,
} as const;

export function MessageBubble({
  variant = "soft",
  align,
  animateIn = false,
  labels,
  className,
  children,
  initial,
  animate,
  exit,
  transition,
  layout,
  ...props
}: MessageBubbleProps) {
  const reduce = useReducedMotion() ?? false;
  const messageSide = useContext(MessageSideContext);
  const resolvedAlign = align ?? messageSide ?? "start";

  return (
    <MessageBubbleContext.Provider
      value={{ align: resolvedAlign, animateIn, variant, labels }}
    >
      <motion.div
        data-slot="message-bubble"
        data-align={resolvedAlign}
        data-variant={variant}
        layout={layout}
        initial={initial ?? false}
        animate={animate}
        exit={
          exit ??
          (reduce ? { opacity: 0 } : { opacity: 0, y: -3, scale: 0.99 })
        }
        transition={transition ?? (reduce ? { duration: 0.12 } : SPRING_LAYOUT)}
        className={cn(
          "group/bubble flex w-full flex-col",
          resolvedAlign === "end" ? "items-end" : "items-start",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    </MessageBubbleContext.Provider>
  );
}

function bubbleContentClass(
  variant: MessageBubbleVariant,
  align: MessageBubbleAlign,
  interactive: boolean,
) {
  return cn(
    "relative z-0 min-w-9 max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 text-foreground",
    // The corner by the speaker is tighter, so a bubble points at who said it.
    align === "end" ? "rounded-ee-md" : "rounded-es-md",
    "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-background/60 [&_pre]:p-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
    variant === "solid" &&
      "text-primary-foreground [&_code]:bg-primary-foreground/15 [&_pre]:bg-primary-foreground/15",
    variant === "ghost" && "w-full max-w-none rounded-none px-0 py-0",
    variant === "danger" && "text-destructive",
    interactive &&
      "cursor-pointer text-left outline-none transition-[background-color,color,transform] duration-150 hover:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]",
  );
}

function bubbleSurfaceClass(
  variant: MessageBubbleVariant,
  align: MessageBubbleAlign,
) {
  return cn(
    "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
    align === "end" ? "origin-bottom-right" : "origin-bottom-left",
    variant === "solid" && "bg-primary",
    variant === "soft" && "bg-muted",
    variant === "tint" && "bg-muted",
    variant === "outline" && "border border-border/70 bg-background",
    variant === "danger" && "bg-destructive/10",
  );
}

export function MessageBubbleContent({
  render,
  className,
  children,
  ref,
  ...props
}: MessageBubbleContentProps) {
  const reduce = useReducedMotion() ?? false;
  const { align = "start", animateIn, variant } =
    useContext(MessageBubbleContext);
  const interactive =
    render?.type === "button" || render?.type === "a";
  const classes = cn(
    bubbleContentClass(variant, align, interactive),
    className,
  );
  const composedChildren = (
    <>
      {/* The surface pops in once, then always matches its text: a surface
          that springs after its content leaves streamed lines and expanded
          text hanging outside the bubble. */}
      {variant !== "ghost" ? (
        <motion.span
          aria-hidden="true"
          initial={
            animateIn && !reduce
              ? {
                  opacity: 0,
                  scale: 0.92,
                }
              : false
          }
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.12, ease: EASE_OUT },
                  scale: BUBBLE_POP,
                }
          }
          className={bubbleSurfaceClass(variant, align)}
        />
      ) : null}
      <motion.div
        initial={animateIn ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={
          reduce ? { duration: 0.12, ease: EASE_OUT } : BUBBLE_CONTENT_REVEAL
        }
        className="relative"
      >
        {children}
      </motion.div>
    </>
  );

  if (render) {
    const child = render as ReactElement<
      Record<string, unknown> & { className?: string; ref?: Ref<HTMLElement> }
    >;

    return cloneElement(child, {
      ...props,
      ref: mergeRefs(child.props.ref, ref as Ref<HTMLElement> | undefined),
      className: cn(classes, child.props.className),
      children: composedChildren,
      "data-slot": "message-bubble-content",
    });
  }

  return (
    <div
      ref={ref}
      data-slot="message-bubble-content"
      className={classes}
      {...props}
    >
      {composedChildren}
    </div>
  );
}

export function MessageBubbleGroup({
  spacing = "compact",
  className,
  ...props
}: MessageBubbleGroupProps) {
  return (
    <div
      data-slot="message-bubble-group"
      className={cn(
        "flex w-full flex-col",
        spacing === "compact" ? "gap-1.5" : "gap-3",
        // A bubble that follows one from the same speaker tightens its top
        // corner on that side too, so the run reads as one turn.
        "[&>[data-align=end]+[data-align=end]_[data-slot=message-bubble-content]]:rounded-se-md",
        "[&>[data-align=start]+[data-align=start]_[data-slot=message-bubble-content]]:rounded-ss-md",
        className,
      )}
      {...props}
    />
  );
}

const LINE_CLAMP_CLASS = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
} as const;

export function MessageBubbleCollapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  collapsedLines = 4,
  moreLabel,
  lessLabel,
  contentClassName,
  triggerClassName,
  className,
  children,
  ...props
}: MessageBubbleCollapsibleProps) {
  const reduce = useReducedMotion() ?? false;
  const contentId = useId();
  const t = useMessages(
    "messageBubble",
    messageBubbleMessages,
    useContext(MessageBubbleContext).labels,
  );
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const contentRef = useRef<HTMLDivElement>(null);
  // Where the clamped text ended, as a share of the full text: the reveal
  // starts there, so the lines already on screen never blink.
  const clampedHeight = useRef(0);
  // The fade mask, from solid (`solid`%) to clear (`clear`%). Clamped, it
  // softens the last lines; open, it wipes down until the text is all solid.
  const solid = useMotionValue(currentOpen ? 100 : CLAMP_SOLID);
  const clear = useMotionValue(currentOpen ? 100 + WIPE_EDGE : 100);
  const mask = useMotionTemplate`linear-gradient(to bottom, #000 ${solid}%, transparent ${clear}%)`;

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) clampedHeight.current = contentRef.current?.offsetHeight ?? 0;
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, open],
  );

  // Opening shows the whole text at once (no height animation) and wipes the
  // new lines in from the top; closing clamps straight back.
  useLayoutEffect(() => {
    if (!currentOpen) {
      solid.set(CLAMP_SOLID);
      clear.set(100);
      return;
    }
    const full = contentRef.current?.offsetHeight ?? 0;
    const start =
      reduce || !full || !clampedHeight.current
        ? 100
        : Math.min(100, (clampedHeight.current / full) * 100 - WIPE_EDGE);
    solid.set(start);
    clear.set(start + WIPE_EDGE);
    if (start >= 100) return;
    const toSolid = animate(solid, 100, REVEAL);
    const toClear = animate(clear, 100 + WIPE_EDGE, REVEAL);
    return () => {
      toSolid.stop();
      toClear.stop();
    };
  }, [currentOpen, reduce, solid, clear]);

  return (
    <div
      data-slot="message-bubble-collapsible"
      data-state={currentOpen ? "open" : "closed"}
      className={cn("w-full", className)}
      {...props}
    >
      <motion.div
        ref={contentRef}
        id={contentId}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className={cn(
          !currentOpen && LINE_CLAMP_CLASS[collapsedLines],
          contentClassName,
        )}
      >
        {children}
      </motion.div>
      <button
        type="button"
        aria-expanded={currentOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!currentOpen)}
        className={cn(
          "mt-2 inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          triggerClassName,
        )}
      >
        <span>{currentOpen
            ? (lessLabel ?? t("showLess"))
            : (moreLabel ?? t("showMore"))}</span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: currentOpen ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : SPRING_SWAP}
        >
          <ChevronDown className="size-3.5" />
        </motion.span>
      </button>
    </div>
  );
}
