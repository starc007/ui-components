"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

export type SelectOption<T = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export interface SelectProps<T = string> {
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function Select<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = "Select…",
  label,
  className,
  disabled,
}: SelectProps<T>) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label ? <span className="text-sm font-medium text-(--color-fg)">{label}</span> : null}
      <Listbox value={value ?? undefined} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border border-(--color-border) bg-(--color-bg-elev) px-3 text-sm transition-colors",
              "hover:border-(--color-border-strong)",
              "focus:border-(--color-accent) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/30",
              "disabled:opacity-50",
            )}
          >
            <span className={selected ? "text-(--color-fg)" : "text-(--color-fg-muted)"}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown className="h-4 w-4 text-(--color-fg-muted)" />
          </ListboxButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 -translate-y-1"
          >
            <ListboxOptions className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-(--color-border) bg-(--color-bg-elev) p-1 shadow-xl shadow-black/20 focus:outline-none">
              {options.map((opt) => (
                <ListboxOption
                  key={String(opt.value)}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={({ focus, selected: sel }) =>
                    cn(
                      "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm",
                      focus && "bg-(--color-bg)",
                      sel && "text-(--color-accent)",
                      opt.disabled && "opacity-50 cursor-not-allowed",
                    )
                  }
                >
                  {({ selected: sel }) => (
                    <>
                      <span>{opt.label}</span>
                      {sel ? <Check className="h-4 w-4" /> : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
