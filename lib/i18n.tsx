"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

/**
 * A component's messages. Plain strings with `{name}` placeholders, so a
 * dictionary stays JSON-serializable and can be passed from a server layout.
 * There are no plural forms: write messages that read correctly for any count.
 */
export type Messages = Record<string, string>;

/** A language file: component namespace → any subset of that component's messages. */
export type LocaleMessages = Record<string, Partial<Messages>>;

type LocaleContextValue = {
  locale?: string;
  messages: LocaleMessages;
};

const NO_MESSAGES: LocaleMessages = {};

const LocaleContext = createContext<LocaleContextValue>({ messages: NO_MESSAGES });

/** Without a locale, digits stay plain so server and client render the same text. */
export function formatNumber(value: number, locale?: string) {
  return locale ? new Intl.NumberFormat(locale).format(value) : String(value);
}

export interface LocaleProviderProps {
  /** BCP 47 tag, e.g. `de`, `pt-BR`. Drives `Intl` number formatting. */
  locale: string;
  /**
   * Component namespace → translated strings. Missing keys fall back to English.
   * Pass a stable object (a module constant, imported JSON or a memoized value):
   * a new object each render gives every translated component a new `t`.
   */
  messages?: LocaleMessages;
  children: ReactNode;
}

export function LocaleProvider({ locale, messages = NO_MESSAGES, children }: LocaleProviderProps) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): { locale?: string } {
  return { locale: useContext(LocaleContext).locale };
}

/**
 * Resolves a component's strings: `labels` prop, then the provider's
 * messages for `namespace`, then the component's English `defaults`.
 * Numbers passed as values are formatted for the provider's locale.
 */
export function useMessages<T extends Messages>(
  namespace: string,
  defaults: T,
  labels?: Partial<T>,
) {
  const { locale, messages } = useContext(LocaleContext);
  const provided = messages[namespace];
  // Inline `labels={{ … }}` is a new object every render. Keying it by content
  // keeps `t` one identity until a label changes, so effects and memos that
  // depend on `t` don't re-run per render, and render-time reads never lag.
  const labelsKey = labels ? JSON.stringify(labels) : "";
  const stableLabels = useMemo(
    () => (labelsKey ? (JSON.parse(labelsKey) as Partial<T>) : undefined),
    [labelsKey],
  );

  return useCallback(
    (key: keyof T & string, values?: Record<string, string | number>) => {
      const template = stableLabels?.[key] ?? provided?.[key] ?? defaults[key];
      if (!values) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = values[name];
        if (value === undefined) return match;
        return typeof value === "number" ? formatNumber(value, locale) : value;
      });
    },
    [defaults, stableLabels, locale, provided],
  );
}
