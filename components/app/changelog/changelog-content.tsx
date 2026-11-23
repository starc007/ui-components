"use client";

import { ArrowUpRight, Plus, Rss, TrendingUp, Wrench } from "lucide-react";
import { type ComponentType, useState } from "react";
import { useFormatter, useTranslations } from "use-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { Tooltip } from "@/components/motion/tooltip";
import { CHANGELOG_FEED_PATH, changelogAnchor, changelogEntries, changelogItemLink } from "@/lib/changelog";
import type { ChangelogEntry, ChangelogItem } from "@/lib/changelog/types";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "new", "improved", "fixed"] as const;
type Filter = (typeof FILTERS)[number];

const TYPE_ICON: Record<ChangelogItem["type"], ComponentType<{ className?: string }>> = {
  new: Plus,
  improved: TrendingUp,
  fixed: Wrench,
};

/** Releases grouped by month, newest first, keeping only the items the filter shows. */
function groupByMonth(entries: ChangelogEntry[], filter: Filter) {
  const months: { key: string; entries: ChangelogEntry[] }[] = [];
  for (const entry of entries) {
    const items = filter === "all" ? entry.items : entry.items.filter((item) => item.type === filter);
    if (items.length === 0) continue;
    const key = entry.date.slice(0, 7);
    let month = months.at(-1);
    if (month?.key !== key) {
      month = { key, entries: [] };
      months.push(month);
    }
    month.entries.push({ ...entry, items });
  }
  return months;
}

/**
 * The changelog page body: a centred header with type filters and the RSS
 * feed, then every release on a timeline, grouped by month.
 */
export function ChangelogContent() {
  const t = useTranslations("Native.changelog");
  const format = useFormatter();
  const [filter, setFilter] = useState<Filter>("all");
  const months = groupByMonth(changelogEntries, filter);

  const date = (value: string, options: { month: "long" | "short"; day?: "numeric"; year?: "numeric" }) =>
    format.dateTime(new Date(`${value}T00:00:00Z`), { ...options, timeZone: "UTC" });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-16 sm:pt-14">
      <header className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">{t("heading")}</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{t("description")}</p>
        <div className="mt-8 flex items-center gap-2">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)} variant="pill">
            <TabsList aria-label={t("filterLabel")}>
              {FILTERS.map((key) => (
                <TabsTrigger key={key} value={key}>
                  {t(key)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tooltip content={t("rss")} side="top">
            <a
              href={CHANGELOG_FEED_PATH}
              aria-label={t("rss")}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Rss aria-hidden="true" className="size-4" />
            </a>
          </Tooltip>
        </div>
      </header>

      <div className="mt-12 space-y-12">
        {months.map((month) => (
          <section key={month.key} aria-labelledby={`month-${month.key}`}>
            <h2 id={`month-${month.key}`} className="text-sm font-medium text-foreground">
              {date(`${month.key}-01`, { month: "long", year: "numeric" })}
            </h2>
            <ol className="mt-4">
              {month.entries.map((entry, index) => {
                const hasNew = entry.items.some((item) => item.type === "new");
                const last = index === month.entries.length - 1;
                return (
                  <li
                    key={entry.date}
                    id={changelogAnchor(entry.date)}
                    className="relative grid scroll-mt-24 grid-cols-[3.5rem_1fr] gap-x-4 sm:grid-cols-[5rem_1fr] sm:gap-x-6"
                  >
                    <time dateTime={entry.date} className="pt-px text-sm text-muted-foreground tabular-nums">
                      {date(entry.date, { month: "short", day: "numeric" })}
                    </time>
                    {/* The timeline: a rule down the left of each release, a dot at its title. */}
                    <div className={cn("relative border-l border-border pl-5 sm:pl-6", last ? "pb-2" : "pb-9")}>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute top-[7px] -left-[5px] size-[9px] rounded-full ring-4 ring-background",
                          hasNew ? "bg-primary" : "bg-muted-foreground/40",
                        )}
                      />
                      <h3 className="text-base font-medium tracking-tight text-foreground">
                        <a
                          href={`#${changelogAnchor(entry.date)}`}
                          className="rounded-sm hover:underline hover:decoration-border hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          {entry.title}
                        </a>
                      </h3>
                      {entry.summary ? (
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{entry.summary}</p>
                      ) : null}
                      <ul className="mt-3 space-y-3">
                        {entry.items.map((item) => (
                          <ChangeRow key={item.text} item={item} label={t(item.type)} />
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function ChangeRow({ item, label }: { item: ChangelogItem; label: string }) {
  const t = useTranslations("Native.changelog");
  const Icon = TYPE_ICON[item.type];
  const link = changelogItemLink(item);
  return (
    <li className="flex items-start gap-3 text-sm leading-6">
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon aria-hidden="true" className="size-3" />
        <span className="sr-only">{label}</span>
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground">{item.text}</p>
        {link ? (
          <Link
            href={link.href}
            className="mt-1.5 inline-flex h-6 items-center gap-1 rounded-full border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {link.label ?? t("learnMore")}
            <ArrowUpRight aria-hidden="true" className="size-3 text-muted-foreground" />
          </Link>
        ) : null}
      </div>
    </li>
  );
}
