"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale, useTranslations } from "use-intl";
import { useState } from "react";
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph";
import { usePathname } from "@/i18n/navigation";
import { LANGUAGES, type Locale, localizedPath, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Chrome.language");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Query and hash, read when the menu opens, so switching keeps the reader's place.
  const [suffix, setSuffix] = useState("");

  return (
    <MorphPopover
      open={open}
      onOpenChange={(next) => {
        if (next) setSuffix(window.location.search + window.location.hash);
        setOpen(next);
      }}
    >
      <MorphPopoverTrigger>
        <button
          type="button"
          aria-label={t("label", { language: LANGUAGES[locale].name })}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-2xl border border-border bg-card/20 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
            className,
          )}
        >
          <Languages aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="uppercase">{locale}</span>
          <ChevronDown aria-hidden="true" className="h-3 w-3" />
        </button>
      </MorphPopoverTrigger>
      <MorphPopoverContent align="end" className="w-40 p-1.5">
        <nav aria-label={t("menu")}>
          {routing.locales.map((each) => (
            // A plain link, not next-intl's Link: changing language reloads the
            // document so <html lang> and the root layout (including the
            // theme script) start fresh instead of remounting on the client.
            <a
              key={each}
              href={localizedPath(pathname, each) + suffix}
              lang={each}
              hrefLang={each}
              aria-current={each === locale ? "true" : undefined}
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
            >
              {LANGUAGES[each].name}
              {each === locale ? (
                <Check aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
              ) : null}
            </a>
          ))}
        </nav>
      </MorphPopoverContent>
    </MorphPopover>
  );
}
