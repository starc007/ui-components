import { Rss } from "lucide-react";
import Link from "next/link";
import {
  CHANGE_LABELS,
  CHANGELOG_DESCRIPTION,
  CHANGELOG_FEED_PATH,
  changelogAnchor,
  changelogEntries,
  changelogItemLink,
} from "@/lib/changelog";
import type { ChangelogItem } from "@/lib/changelog/types";
import { cn } from "@/lib/utils";

const BADGE_CLASS: Record<ChangelogItem["type"], string> = {
  new: "border-accent/30 bg-accent/10 text-foreground",
  improved: "border-border bg-muted text-muted-foreground",
  fixed: "border-border bg-muted text-muted-foreground",
};

const formatWeek = (date: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

/** The changelog page body: header, feed link and the list of weeks. */
export function ChangelogContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Changelog
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          What&apos;s new in beUI
        </h1>
        <p className="mt-3 text-muted-foreground">{CHANGELOG_DESCRIPTION}</p>
        <a
          href={CHANGELOG_FEED_PATH}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Rss aria-hidden="true" className="size-4" />
          RSS feed
        </a>
      </header>

      <ol className="mt-12">
        {changelogEntries.map((entry) => (
          <li
            key={entry.date}
            id={changelogAnchor(entry.date)}
            className="scroll-mt-24 border-t border-border py-8 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-6"
          >
            <p className="text-sm text-muted-foreground">
              Week of{" "}
              <time dateTime={entry.date} className="block text-foreground">
                {formatWeek(entry.date)}
              </time>
            </p>
            <div className="mt-2 min-w-0 sm:mt-0">
              <h2 className="text-lg font-medium tracking-tight text-foreground">
                <a
                  href={`#${changelogAnchor(entry.date)}`}
                  className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {entry.title}
                </a>
              </h2>
              {entry.summary ? (
                <p className="mt-2 leading-7 text-muted-foreground">{entry.summary}</p>
              ) : null}
              <ul className="mt-4 space-y-3">
                {entry.items.map((item) => {
                  const link = changelogItemLink(item);
                  return (
                    <li key={item.text} className="flex items-start gap-3 text-sm leading-6">
                      <span
                        className={cn(
                          "mt-0.5 inline-flex w-[4.75rem] shrink-0 justify-center rounded-full border px-2 text-[11px] font-medium leading-5",
                          BADGE_CLASS[item.type],
                        )}
                      >
                        {CHANGE_LABELS[item.type]}
                      </span>
                      <span className="min-w-0 text-muted-foreground">
                        {item.text}
                        {link ? (
                          <>
                            {" "}
                            <Link
                              href={link.href}
                              className="whitespace-nowrap text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            >
                              {link.label ? `View ${link.label}` : "Learn more"}
                            </Link>
                          </>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
