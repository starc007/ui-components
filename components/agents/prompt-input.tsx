"use client";

import { ArrowUp, ChevronDown, Plus, Square } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ClipResizeFrame } from "@/components/agents/clip-resize-frame";
import { Button } from "@/components/motion/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/motion/dropdown-menu";
import { MENU_ITEM_CLASS, MenuItemHighlight } from "@/components/motion/menu/menu-item-highlight";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** One identity for the default, so the filtered list stays stable. */
const NO_COMMANDS: PromptCommand[] = [];

// The slash list rises in and drops away faster; rows fade in and out as the
// filter changes, and the rest slide into place.
const LIST_IN = { duration: 0.18, ease: EASE_OUT } as const;
const LIST_OUT = { duration: 0.12, ease: EASE_OUT } as const;
const ROW_OUT = { duration: 0.1, ease: EASE_OUT } as const;
const ROW_MOVE = { layout: SPRING_LAYOUT, opacity: { duration: 0.16, ease: EASE_OUT } } as const;

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const promptInputMessages = {
  placeholder: "Ask the agent to do something…",
  label: "Prompt",
  addToPrompt: "Add to prompt",
  chooseModel: "Choose model",
  send: "Send prompt",
  stop: "Stop generating",
  commands: "Commands",
};

export type PromptInputMessages = typeof promptInputMessages;

export interface PromptModel {
  /** Unique key, passed to `onModelChange` and `onSubmit`. */
  value: string;
  /** Name shown in the model menu and on its trigger when selected. */
  label: ReactNode;
  /** Icon before the label in the menu and on the trigger. */
  icon?: ReactNode;
  /** Stops the model from being picked. */
  disabled?: boolean;
}

export interface PromptAction {
  /** Unique key, passed to `onAction` when the item is chosen. */
  value: string;
  /** Item text in the add menu. */
  label: ReactNode;
  /** Muted line under the label. */
  description?: ReactNode;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Stops the item from being chosen. */
  disabled?: boolean;
}

export interface PromptCommand {
  /** What follows the slash: typing `/value` finds it, and picking it writes `/value ` into the prompt. */
  value: string;
  /** Name shown in the command list. Also matched while typing. */
  label: string;
  /** Muted line beside the label. */
  description?: ReactNode;
  /** Icon before the label. */
  icon?: ReactNode;
}

export interface PromptInputProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onChange" | "onSubmit" | "children"
> {
  /** The prompt text, for controlled use. */
  value?: string;
  /** The initial prompt text when uncontrolled. Default: "" */
  defaultValue?: string;
  /** Called with the new text on every edit. */
  onValueChange?: (value: string) => void;
  /** Models listed in the model menu. Hidden when empty. */
  models?: PromptModel[];
  /** The selected model's value, for controlled use. */
  model?: string;
  /** The initial model when uncontrolled. Default: the first model */
  defaultModel?: string;
  /** Called with the model's value when a model is picked. */
  onModelChange?: (model: string) => void;
  /** Items in the add menu next to the input. Hidden when empty. */
  actions?: PromptAction[];
  /** Called with the action's value when an add menu item is chosen. */
  onAction?: (action: string) => void;
  /** Slash commands. Typing `/` at the start of a word lists them above the input. Hidden when empty. */
  commands?: PromptCommand[];
  /** Called with the command's value when a slash command is picked. */
  onCommand?: (command: string) => void;
  /** Called with the trimmed prompt and selected model on Enter or the send button. */
  onSubmit?: (value: string, model?: string) => void | Promise<void>;
  /** Swaps send for a stop button and blocks new prompts. Default: false */
  loading?: boolean;
  /** Called when the stop button is pressed while loading. */
  onStop?: () => void;
  /** Height of the empty input, in text rows. Default: 2 */
  minRows?: number;
  /** Rows the input grows to before it scrolls. Default: 8 */
  maxRows?: number;
  /** Extra controls placed between the add menu and the model menu. */
  leadingAction?: ReactNode;
  /** Override any built-in string. */
  labels?: Partial<PromptInputMessages>;
  /** Classes merged onto the form element. */
  className?: string;
}

export function PromptInput({
  value,
  defaultValue = "",
  onValueChange,
  models = [],
  model,
  defaultModel,
  onModelChange,
  actions = [],
  onAction,
  commands = NO_COMMANDS,
  onCommand,
  onSubmit,
  loading = false,
  onStop,
  minRows = 2,
  maxRows = 8,
  leadingAction,
  labels,
  className,
  disabled,
  placeholder,
  "aria-label": ariaLabel,
  onKeyDown,
  ...textareaProps
}: PromptInputProps) {
  const t = useMessages("promptInput", promptInputMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalModel, setInternalModel] = useState(
    defaultModel ?? models[0]?.value,
  );
  const [actionsOpen, setActionsOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const currentValue = value ?? internalValue;
  const currentModelValue = model ?? internalModel;
  const currentModel = models.find(
    (option) => option.value === currentModelValue,
  );
  const canSubmit = Boolean(currentValue.trim()) && !disabled && !loading;

  // Slash commands: the word before the caret, when it starts with `/`.
  const [caret, setCaret] = useState(currentValue.length);
  // Escape closes the list for the slash it was opened by, until another one.
  const [dismissedAt, setDismissedAt] = useState(-1);
  const baseId = useId();
  const slash = commands.length
    ? /(?:^|\s)\/([\w-]*)$/.exec(currentValue.slice(0, caret))
    : null;
  const query = slash ? slash[1].toLowerCase() : "";
  const slashAt = slash ? caret - slash[1].length - 1 : -1;
  const matches = slash
    ? commands.filter(
        (command) =>
          command.value.toLowerCase().includes(query) ||
          command.label.toLowerCase().includes(query),
      )
    : NO_COMMANDS;
  const slashOpen = matches.length > 0 && slashAt !== dismissedAt && !disabled;
  const commandRows = matches.map((command) => ({ id: command.value }));
  const { activeIndex, moveTo, moveActive } = useRowCursor(commandRows, query);
  const activeCommand = slashOpen ? matches[activeIndex] : undefined;
  const listId = `${baseId}-commands`;
  const optionId = (value: string) => `${baseId}-command-${value}`;
  // Pointer moves glide the highlight; arrow keys jump it, a spring would
  // only trail behind fast arrowing.
  const [glide, setGlide] = useState(false);

  const pickCommand = (command: PromptCommand) => {
    const inserted = `/${command.value} `;
    const next =
      currentValue.slice(0, slashAt) + inserted + currentValue.slice(caret);
    const nextCaret = slashAt + inserted.length;
    setValue(next);
    setCaret(nextCaret);
    onCommand?.(command.value);
    requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true });
      textareaRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    const measurement = measurementRef.current;
    if (!textarea || !measurement || textarea.value !== currentValue) return;

    const lineHeight = 24;
    const nextHeight = Math.min(
      Math.max(measurement.scrollHeight, minRows * lineHeight),
      maxRows * lineHeight,
    );
    const height = `${nextHeight}px`;
    if (textarea.style.height !== height) textarea.style.height = height;
  }, [currentValue, maxRows, minRows]);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [resizeTextarea]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(resizeTextarea);
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [resizeTextarea]);

  const setValue = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const setModel = (next: string) => {
    if (model === undefined) setInternalModel(next);
    onModelChange?.(next);
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const prompt = currentValue.trim();
    if (!prompt || disabled || loading) return;

    onSubmit?.(prompt, currentModelValue);
    if (value === undefined) setInternalValue("");
    textareaRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (slashOpen && !event.defaultPrevented && !event.nativeEvent.isComposing) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setGlide(false);
        moveActive(event.key === "ArrowDown" ? 1 : -1);
        return;
      }
      if ((event.key === "Enter" && !event.shiftKey) || event.key === "Tab") {
        event.preventDefault();
        if (activeCommand) pickCommand(activeCommand);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setDismissedAt(slashAt);
        return;
      }
    }
    if (
      event.defaultPrevented ||
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    event.preventDefault();
    submit();
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "relative w-full rounded-3xl border border-border/80 bg-background p-2 transition-colors focus-within:border-foreground/25",
        disabled && "opacity-60",
        className,
      )}
    >
      <div
        ref={measurementRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-x-2 top-0 whitespace-pre-wrap px-2 text-sm leading-6 [overflow-wrap:break-word]"
      >
        {`${currentValue}\u200b`}
      </div>

      {/* The list rises a few px out of the input as it fades in, and drops
          back faster. Focus stays in the input, which drives it with the arrow
          keys. As you filter, its top edge glides (the list is anchored at its
          bottom, above the input), leaving rows fade and the rest slide into
          place, instead of the edge and rows jumping. */}
      <AnimatePresence>
        {slashOpen ? (
          <motion.div
            key="commands"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduce
                ? { opacity: 0, pointerEvents: "none", transition: LIST_OUT }
                : { opacity: 0, y: 4, pointerEvents: "none", transition: LIST_OUT }
            }
            transition={LIST_IN}
            style={{ transformOrigin: "bottom left" }}
            className="absolute inset-x-0 bottom-full z-20 mb-2"
          >
            <ClipResizeFrame edge="top" contentClassName="p-2">
              <div
                id={listId}
                role="listbox"
                aria-label={t("commands")}
                className="relative max-h-60 overflow-y-auto overscroll-contain"
              >
                <AnimatePresence initial={false} mode="popLayout">
            {matches.map((command, index) => {
              const active = index === activeIndex;
              return (
                <motion.button
                  layout={reduce ? false : "position"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: ROW_OUT }}
                  transition={ROW_MOVE}
                  key={command.value}
                  id={optionId(command.value)}
                  type="button"
                  role="option"
                  aria-selected={active}
                  tabIndex={-1}
                  onPointerMove={() => {
                    if (active) return;
                    setGlide(true);
                    moveTo(command.value);
                  }}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => pickCommand(command)}
                  className={cn(MENU_ITEM_CLASS, "cursor-default gap-2.5 text-foreground")}
                >
                  {active ? (
                    <MenuItemHighlight
                      layoutId={`${baseId}-command-highlight`}
                      reduce={reduce}
                      instant={!glide}
                    />
                  ) : null}
                  {command.icon ? (
                    <span
                      aria-hidden="true"
                      className="flex shrink-0 text-muted-foreground [&_svg]:size-4"
                    >
                      {command.icon}
                    </span>
                  ) : null}
                  <span className="shrink-0">{command.label}</span>
                  {command.description ? (
                    <span className="min-w-0 truncate text-xs text-muted-foreground">
                      {command.description}
                    </span>
                  ) : null}
                  <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground/70">
                    /{command.value}
                  </span>
                </motion.button>
              );
            })}
                </AnimatePresence>
              </div>
            </ClipResizeFrame>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <textarea
        ref={textareaRef}
        value={currentValue}
        disabled={disabled}
        placeholder={placeholder ?? t("placeholder")}
        aria-label={ariaLabel ?? t("label")}
        rows={minRows}
        {...textareaProps}
        aria-autocomplete={commands.length ? "list" : undefined}
        aria-controls={slashOpen ? listId : undefined}
        aria-activedescendant={activeCommand ? optionId(activeCommand.value) : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          setCaret(event.target.selectionStart);
        }}
        onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
        onKeyDown={handleKeyDown}
        className="scrollbar-hide block w-full resize-none overflow-y-auto bg-transparent px-2 pt-1.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/55"
      />

      <div className="mt-1 flex min-h-8 items-center gap-1">
        {actions.length ? (
          // The library menu: arrow keys and typeahead, a highlight that
          // glides between rows, and no animation when the keyboard opens it.
          <DropdownMenu open={actionsOpen} onOpenChange={setActionsOpen}>
            <Tooltip content={t("addToPrompt")} side="top">
              <AddButton
                open={actionsOpen}
                reduce={reduce}
                disabled={disabled || loading}
                aria-label={t("addToPrompt")}
              />
            </Tooltip>
            <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-72">
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.value}
                  disabled={action.disabled}
                  onSelect={() => onAction?.(action.value)}
                  textValue={typeof action.label === "string" ? action.label : undefined}
                  className="items-start"
                >
                  {action.icon ? (
                    <span aria-hidden="true" className="mt-0.5 flex shrink-0">
                      {action.icon}
                    </span>
                  ) : null}
                  {/* One line each: a menu row is read at a glance. */}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{action.label}</span>
                    {action.description ? (
                      <span className="block truncate text-xs leading-4 text-muted-foreground">
                        {action.description}
                      </span>
                    ) : null}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {leadingAction}
        {models.length ? (
          // The same menu as the plus: a model is a pick from a short list,
          // with the check at the end of the chosen row.
          <DropdownMenu open={modelsOpen} onOpenChange={setModelsOpen}>
            <DropdownMenuTrigger disabled={disabled || loading}>
              <button
                type="button"
                disabled={disabled || loading}
                className="inline-flex h-8 min-w-0 max-w-52 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none data-[state=open]:bg-foreground/[0.06] data-[state=open]:text-foreground"
              >
                {currentModel?.icon ? (
                  <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-3.5">
                    {currentModel.icon}
                  </span>
                ) : null}
                <span className="truncate">{currentModel?.label ?? t("chooseModel")}</span>
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: modelsOpen ? 180 : 0 }}
                  transition={reduce ? { duration: 0 } : SPRING_SWAP}
                  className="flex shrink-0"
                >
                  <ChevronDown className="size-3.5" />
                </motion.span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
              <DropdownMenuRadioGroup value={currentModelValue ?? ""} onValueChange={setModel}>
                {models.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    closeOnSelect
                    textValue={typeof option.label === "string" ? option.label : undefined}
                  >
                    {option.icon ? (
                      <span aria-hidden="true" className="flex shrink-0">
                        {option.icon}
                      </span>
                    ) : null}
                    <span className="min-w-0 truncate">{option.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <span className="relative ml-auto flex">
          <Tooltip content={loading ? t("stop") : t("send")} side="top">
          <Button
            type={loading ? "button" : "submit"}
            size="icon"
            disabled={loading ? !onStop : !canSubmit}
            aria-label={loading ? t("stop") : t("send")}
            onClick={loading ? onStop : undefined}
            className={cn(
              "size-8 rounded-full",
              // Nothing to send: a quiet gray chip, not a dimmed primary. It
              // lights up the moment there is a prompt.
              !loading && !canSubmit && "bg-foreground/[0.06] text-muted-foreground disabled:opacity-100",
            )}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={loading ? "stop" : "send"}
                // A little blur melts the arrow into the square, so the swap
                // reads as one icon changing rather than two crossing.
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 3, scale: 0.8, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3, scale: 0.8, filter: "blur(2px)" }}
                transition={reduce ? { duration: 0 } : SPRING_SWAP}
                className="grid place-items-center"
              >
                {loading ? (
                  <Square className="size-3 fill-current" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
          </Tooltip>
          {/* While the agent works, a thin arc circles the stop button. */}
          <AnimatePresence>
            {loading ? (
              <motion.svg
                key="working"
                aria-hidden="true"
                viewBox="0 0 40 40"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1, rotate: reduce ? 0 : 360 }}
                exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_OUT } }}
                transition={{
                  opacity: { duration: 0.2, ease: EASE_OUT },
                  scale: { duration: 0.2, ease: EASE_OUT },
                  rotate: { duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY },
                }}
                className="pointer-events-none absolute -inset-1 size-10 text-primary"
              >
                <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth="1.5" />
                <circle
                  cx="20"
                  cy="20"
                  r="19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="30 90"
                />
              </motion.svg>
            ) : null}
          </AnimatePresence>
        </span>
      </div>
    </form>
  );
}

/**
 * The plus that opens the add menu. Its own component so the tooltip around it
 * and the menu trigger inside both reach the button: the plus turns into a
 * cross while the menu is open.
 */
function AddButton({
  open,
  reduce,
  ...props
}: ComponentProps<typeof Button> & { open: boolean; reduce: boolean }) {
  return (
    <DropdownMenuTrigger disabled={props.disabled}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        {...props}
        className="size-8 rounded-full data-[state=open]:bg-foreground/[0.06] data-[state=open]:text-foreground"
      >
        <motion.span
          aria-hidden="true"
          animate={{ rotate: open ? 45 : 0 }}
          transition={reduce ? { duration: 0 } : SPRING_SWAP}
          className="flex"
        >
          <Plus className="size-4" />
        </motion.span>
      </Button>
    </DropdownMenuTrigger>
  );
}
