"use client";

import { ChevronsUpDown, Search } from "lucide-react";
import type {
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from "react";
import { cn } from "@/lib/utils";
import { mergeRefs, useComboboxContext } from "./context";

export interface ComboboxTriggerProps {
  children: ReactNode;
  className?: string;
}

export function ComboboxTrigger({ children, className }: ComboboxTriggerProps) {
  const context = useComboboxContext("ComboboxTrigger");

  return (
    <div
      ref={context.triggerRef}
      id={context.triggerId}
      data-state={context.open ? "open" : "closed"}
      onPointerDown={(event) => {
        if (context.disabled || event.target === context.inputRef.current) return;
        event.preventDefault();
        context.inputRef.current?.focus({ preventScroll: true });
        context.setOpen(true);
      }}
      className={cn(
        "relative z-20 flex h-10 w-full min-w-52 cursor-text items-center justify-between gap-3 rounded-xl border border-border bg-transparent px-3 text-sm text-foreground transition-[border-color] hover:border-(--color-border-strong)",
        "focus-within:ring-2 focus-within:ring-foreground/20",
        context.disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <span className="min-w-0 flex-1 text-left">{children}</span>
      <span aria-hidden className="shrink-0 text-muted-foreground">
        <ChevronsUpDown className="size-4" />
      </span>
    </div>
  );
}

export interface ComboboxValueProps {
  placeholder?: ReactNode;
  children?:
    | ReactNode
    | ((value: string | undefined, label: string | undefined) => ReactNode);
  className?: string;
}

export function ComboboxValue({
  placeholder = "Select an option",
  children,
  className,
}: ComboboxValueProps) {
  const context = useComboboxContext("ComboboxValue");
  const label = context.labelFor(context.value);
  const content =
    typeof children === "function"
      ? children(context.value, label)
      : children ?? label ?? placeholder;

  return (
    <span
      className={cn(
        "block truncate",
        context.value === undefined
          ? "text-muted-foreground"
          : "text-foreground",
        className,
      )}
    >
      {content}
    </span>
  );
}

export interface ComboboxInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "defaultValue" | "value"
  > {
  ref?: Ref<HTMLInputElement>;
  wrapperClassName?: string;
}

export function ComboboxInput({
  ref,
  className,
  wrapperClassName,
  "aria-label": ariaLabel = "Search options",
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  onPointerDown,
  placeholder = "Search…",
  ...props
}: ComboboxInputProps) {
  const context = useComboboxContext("ComboboxInput");
  const selectedLabel = context.labelFor(context.value);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      // Opening is the whole action. While closed the list is still filtering
      // by the query the last session left, so a step taken here would be
      // measured against rows the next render replaces — and stamped with a
      // query it no longer has, which discards it. Open onto the selection,
      // and let the next key step through the list the user can see.
      if (!context.open) {
        context.setOpen(true);
        return;
      }
      context.moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Home" && context.open) {
      event.preventDefault();
      context.moveActive("first");
    } else if (event.key === "End" && context.open) {
      event.preventDefault();
      context.moveActive("last");
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (context.open) context.selectActive();
      else context.setOpen(true);
    } else if (event.key === "Escape" && context.open) {
      event.preventDefault();
      context.setOpen(false, true);
    }
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2",
        wrapperClassName,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      <input
        {...props}
        ref={mergeRefs(ref, context.inputRef)}
        id={context.inputId}
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={context.open}
        aria-controls={context.listId}
        aria-activedescendant={
          context.open ? context.activeItemId : undefined
        }
        autoComplete="off"
        disabled={context.disabled}
        value={context.open ? context.query : (selectedLabel ?? "")}
        placeholder={placeholder}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || context.open) return;
          event.preventDefault();
          context.inputRef.current?.focus({ preventScroll: true });
          context.setOpen(true);
        }}
        onFocus={(event) => {
          context.setOpen(true);
          onFocus?.(event);
        }}
        onClick={(event) => {
          context.setOpen(true);
          onClick?.(event);
        }}
        onChange={(event) => {
          context.setOpen(true);
          context.setQuery(event.target.value);
          onChange?.(event);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          className,
        )}
      />
    </div>
  );
}
