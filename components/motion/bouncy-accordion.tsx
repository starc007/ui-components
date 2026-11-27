"use client";

import { ChevronDown } from "lucide-react";
import {
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  type ReactNode,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type BouncyAccordionItem = {
  /** Unique key, used as the accordion's open value. */
  id: string;
  /** Text on the trigger row, cut off with an ellipsis when long. */
  title: ReactNode;
  /** Body revealed when the row opens. Without it the row has no panel. */
  description?: ReactNode;
  /** Icon shown before the title. Omitted when not set. */
  icon?: ReactNode;
  /** Dims the row and blocks its trigger. */
  disabled?: boolean;
};

export type BouncyAccordionClassNames = {
  /** Classes for the outer wrapper. */
  root?: string;
  /** Classes for each row's card. */
  item?: string;
  /** Classes for each row's trigger button. */
  trigger?: string;
  /** Classes for the icon wrapper in the trigger. */
  icon?: string;
  /** Classes for the title in the trigger. */
  title?: string;
  /** Classes for the chevron that turns when the row opens. */
  chevron?: string;
  /** Classes for the collapsible panel. */
  content?: string;
  /** Classes for the description text inside the panel. */
  description?: string;
};

export interface BouncyAccordionProps {
  /** Rows to render, each with an id, title and optional description. */
  items: BouncyAccordionItem[];
  /** Id of the open item, or null for none, for controlled use. */
  value?: string | null;
  /** Id of the item open at first when uncontrolled. Default: null */
  defaultValue?: string | null;
  /** Called with the open item's id, or null when all close. */
  onValueChange?: (value: string | null) => void;
  /** Lets the open item close when its trigger is pressed again. Default: true */
  collapsible?: boolean;
  /** Classes merged onto the root element. */
  className?: string;
  /** Classes for the root, items, triggers, icons, titles, chevrons and content. */
  classNames?: BouncyAccordionClassNames;
}

// Local springs keep the accordion's connected groups moving together while
// avoiding scale projection on text-heavy row contents.
// Gap spring: must not overshoot y - positive y overshoot drifts items below
// their mt-3 resting point and briefly overlaps the next item.
const ROW_TRANSITION: Transition = {
  type: "spring",
  duration: 0.55,
  bounce: 0.38,
};

const CONTENT_OPEN_TRANSITION: Transition = {
  type: "spring",
  duration: 0.58,
  bounce: 0.32,
};

// The card, its panel and the rows below all share this one curve on close,
// so they bounce together. When the rows sprang on a different curve than the
// card, the next row overshot into the collapsed card, which read as a stutter.
const CLOSE_TRANSITION: Transition = {
  type: "spring",
  duration: 0.55,
  bounce: 0.38,
};

const DESCRIPTION_TRANSITION: Transition = {
  duration: 0.18,
  ease: EASE_OUT,
};

const CHEVRON_TRANSITION: Transition = {
  type: "spring",
  duration: 0.42,
  bounce: 0.28,
};


function useControllableAccordionValue({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = useCallback(
    (next: string | null) => {
      if (!isControlled) {
        setInternalValue(next);
      }

      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return [currentValue, setValue] as const;
}

function BouncyAccordionRow({
  item,
  open,
  startsGroup,
  endsGroup,
  separatedFromPrevious,
  contentId,
  triggerId,
  reduce,
  closing,
  classNames,
  onToggle,
}: {
  item: BouncyAccordionItem;
  open: boolean;
  closing: boolean;
  startsGroup: boolean;
  endsGroup: boolean;
  separatedFromPrevious: boolean;
  contentId: string;
  triggerId: string;
  reduce: boolean | null;
  classNames?: BouncyAccordionClassNames;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const updateHeight = () => {
      setContentHeight(node.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const rowTransition = reduce ? { duration: 0 } : closing ? CLOSE_TRANSITION : ROW_TRANSITION;
  const contentTransition = reduce
    ? { duration: 0 }
    : open
      ? CONTENT_OPEN_TRANSITION
      : CLOSE_TRANSITION;

  return (
    <motion.div
      layout="position"
      initial={false}
      style={{ marginTop: separatedFromPrevious ? 12 : 0 }}
      transition={rowTransition}
    >
      <motion.div
        // The card resizes with its panel, so its fill never snaps ahead of it.
        layout={!reduce}
        data-state={open ? "open" : "closed"}
        initial={false}
        animate={{
          borderTopLeftRadius: startsGroup ? 28 : 0,
          borderTopRightRadius: startsGroup ? 28 : 0,
          borderBottomLeftRadius: endsGroup ? 28 : 0,
          borderBottomRightRadius: endsGroup ? 28 : 0,
        }}
        transition={reduce ? { duration: 0 } : { ...ROW_TRANSITION, layout: contentTransition }}
        className={cn(
          "overflow-hidden bg-card text-card-foreground",
          item.disabled && "opacity-50",
          classNames?.item,
        )}
      >
        <motion.button
          // The card scales while it resizes; layout here counter-scales the
          // header so its icon, title and chevron never stretch.
          layout={!reduce}
          transition={reduce ? { duration: 0 } : { layout: contentTransition }}
          id={triggerId}
          type="button"
          disabled={item.disabled}
          aria-expanded={open}
          aria-controls={contentId}
          onClick={onToggle}
          className={cn(
            "flex min-h-[54px] w-full items-center gap-4 px-5 text-left outline-none transition-colors",
            "focus-visible:bg-muted/25",
            "disabled:pointer-events-none",
            classNames?.trigger,
          )}
        >
          {item.icon ? (
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center text-muted-foreground",
                classNames?.icon,
              )}
            >
              {item.icon}
            </span>
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-base font-medium text-foreground",
              classNames?.title,
            )}
          >
            {item.title}
          </span>
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : CHEVRON_TRANSITION}
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center text-muted-foreground",
              classNames?.chevron,
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.button>

        <motion.section
          layout={!reduce}
          id={contentId}
          aria-labelledby={triggerId}
          aria-hidden={!open}
          inert={!open}
          initial={false}
          // Closed at 1px, not 0: a layout animation scales from the old size
          // to the new one, and a 0px target has no finite scale, so the
          // panel would snap shut instead of animating.
          style={{
            height: item.description ? (open ? contentHeight || "auto" : 1) : 0,
            originY: 0,
          }}
          transition={contentTransition}
          className={cn("overflow-hidden", classNames?.content)}
        >
          <motion.div
            ref={contentRef}
            // Layout here counter-scales the text so it stays sharp.
            layout={!reduce}
            animate={{
              opacity: open ? 1 : 0,
            }}
            transition={
              reduce ? { duration: 0 } : { ...DESCRIPTION_TRANSITION, layout: contentTransition }
            }
            className="px-5 pb-5"
          >
            <div
              className={cn(
                "text-sm leading-6 text-muted-foreground",
                classNames?.description,
              )}
            >
              {item.description}
            </div>
          </motion.div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}

export function BouncyAccordion({
  items,
  value,
  defaultValue = null,
  onValueChange,
  collapsible = true,
  className,
  classNames,
}: BouncyAccordionProps) {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [activeValue, setActiveValue] = useControllableAccordionValue({
    value,
    defaultValue,
    onValueChange,
  });
  const activeIndex = items.findIndex((item) => item.id === activeValue);

  // The item that closed in the latest change, tracked during render so the
  // rows that move because of it pick the close curve in the same commit.
  const [previousValue, setPreviousValue] = useState(activeValue);
  const [closedValue, setClosedValue] = useState<string | null>(null);
  if (previousValue !== activeValue) {
    setPreviousValue(activeValue);
    setClosedValue(previousValue);
  }
  const closedIndex = items.findIndex((item) => item.id === closedValue);

  const toggleItem = useCallback(
    (id: string) => {
      if (activeValue === id) {
        if (collapsible) {
          setActiveValue(null);
        }
        return;
      }

      setActiveValue(id);
    },
    [activeValue, collapsible, setActiveValue],
  );

  return (
    <div className={cn("w-full", className, classNames?.root)}>
      {items.map((item, index) => {
        const open = activeValue === item.id;
        const previousIsOpen = activeIndex === index - 1;
        const nextIsOpen = activeIndex === index + 1;
        const startsGroup = open || index === 0 || previousIsOpen;
        const endsGroup = open || index === items.length - 1 || nextIsOpen;
        const separatedFromPrevious = index > 0 && (open || previousIsOpen);
        const contentId = `${baseId}-${item.id}-content`;
        const triggerId = `${baseId}-${item.id}-trigger`;

        return (
          <BouncyAccordionRow
            key={item.id}
            item={item}
            open={open}
            startsGroup={startsGroup}
            endsGroup={endsGroup}
            separatedFromPrevious={separatedFromPrevious}
            contentId={contentId}
            triggerId={triggerId}
            reduce={reduce}
            // Rows at or below a closing item move with it, on its curve.
            closing={closedIndex !== -1 && index >= closedIndex}
            classNames={classNames}
            onToggle={() => toggleItem(item.id)}
          />
        );
      })}
    </div>
  );
}
