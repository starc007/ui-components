"use client";

import { useSyncExternalStore } from "react";

/**
 * beUI Pro's Black Friday sale. The dates match pro.beui.dev, which applies
 * the discount at checkout, so links only need to send people there.
 */
/** Midnight at the end of Monday Dec 1 in California. */
const ENDS_AT = Date.parse("2026-12-02T08:00:00Z");

export const blackFriday = {
  percent: 20,
  startsAt: Date.parse("2026-11-17T00:00:00Z"),
  endsAt: ENDS_AT,
  /** Last day of the sale, as copy shows it ("Dec 1"). */
  endLabel: new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(ENDS_AT - 1),
} as const;

/** pro.beui.dev pricing, tagged with where on beUI the link sits. */
export function blackFridayProUrl(content: string) {
  return `https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=black_friday&utm_content=${content}#pricing`;
}

function isBlackFridayLive(now = Date.now()) {
  return now >= blackFriday.startsAt && now < blackFriday.endsAt;
}

/** A price after the sale discount, to the cent, as checkout charges it. */
export function blackFridayPrice(dollars: number) {
  return Math.round(dollars * (100 - blackFriday.percent)) / 100;
}

const subscribe = () => () => {};

/**
 * Whether the sale is running. Pages are prerendered while it runs, so the
 * static HTML carries the sale; the browser drops it once the sale ends,
 * without a rebuild.
 */
export function useBlackFridayLive() {
  return useSyncExternalStore(subscribe, () => isBlackFridayLive(), () => true);
}
