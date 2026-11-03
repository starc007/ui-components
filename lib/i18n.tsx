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
 * ponytail: no plural categories yet; add `Intl.PluralRules`-keyed variants
 * when a message needs one.
 */
export type Messages = Record<string, string>;

/** A language file: component namespace → any subset of that component's messages. */
export type LocaleMessages = Record<string, Partial<Messages>>;

export type TextDirection = "ltr" | "rtl";

type LocaleContextValue = {
  locale?: string;
  dir: TextDirection;
  messages: LocaleMessages;
};

const NO_MESSAGES: LocaleMessages = {};
const RTL_LANGUAGES = new Set(["ar", "ckb", "dv", "fa", "he", "ps", "sd", "ug", "ur", "yi"]);

const LocaleContext = createContext<LocaleContextValue>({
  dir: "ltr",
  messages: NO_MESSAGES,
});

export function directionOf(locale?: string): TextDirection {
  const language = locale?.split(/[-_]/)[0]?.toLowerCase();
  return language && RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
}

/** Without a locale, digits stay plain so server and client render the same text. */
export function formatNumber(value: number, locale?: string) {
  return locale ? new Intl.NumberFormat(locale).format(value) : String(value);
}

export interface LocaleProviderProps {
  /** BCP 47 tag, e.g. `de`, `pt-BR`, `ar-EG`. Drives `Intl` number formatting. */
  locale: string;
  /** Defaults to the locale's script direction. Also set `dir` on `<html>`. */
  dir?: TextDirection;
  /** Component namespace → translated strings. Missing keys fall back to English. */
  messages?: LocaleMessages;
  children: ReactNode;
}

export function LocaleProvider({
  locale,
  dir,
  messages = NO_MESSAGES,
  children,
}: LocaleProviderProps) {
  const value = useMemo(
    () => ({ locale, dir: dir ?? directionOf(locale), messages }),
    [locale, dir, messages],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Omit<LocaleContextValue, "messages"> {
  const { locale, dir } = useContext(LocaleContext);
  return { locale, dir };
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

  return useCallback(
    (key: keyof T & string, values?: Record<string, string | number>) => {
      const template = labels?.[key] ?? provided?.[key] ?? defaults[key];
      if (!values) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = values[name];
        if (value === undefined) return match;
        return typeof value === "number" ? formatNumber(value, locale) : value;
      });
    },
    [defaults, labels, locale, provided],
  );
}
