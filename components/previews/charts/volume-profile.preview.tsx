"use client";

import { useId, useState, type KeyboardEvent } from "react";
import {
  VolumeProfile,
  VolumeProfilePlot,
  VolumeProfileSummary,
  VolumeProfileTooltip,
  type VolumeProfileBin,
} from "@/components/charts/volume-profile";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

// Illustrative executed volume, already aggregated into $100 price ranges.
// Price-bin identities stay stable when the session changes.
const sessions = [
  {
    id: "today",
    label: "Today",
    volumes: [
      18, 27, 36, 52, 70, 96, 135, 172, 205, 241, 278, 225, 192, 146, 108, 79, 56, 42, 31, 22, 16,
      11, 8, 5,
    ],
  },
  {
    id: "previous",
    label: "Previous",
    volumes: [
      6, 9, 13, 18, 27, 40, 56, 74, 95, 114, 146, 188, 242, 286, 253, 208, 165, 126, 92, 65, 42, 30,
      21, 14,
    ],
  },
  {
    id: "week",
    label: "Week",
    volumes: [
      75, 104, 143, 214, 305, 382, 494, 626, 795, 902, 1028, 1182, 1097, 973, 825, 695, 589, 481,
      372, 289, 195, 154, 119, 84,
    ],
  },
] as const;
const data: Record<string, readonly VolumeProfileBin[]> = Object.fromEntries(
  sessions.map((session) => [
    session.id,
    session.volumes.map((volume, i) => ({
      id: `price-${64000 + i * 100}`,
      priceLow: 64000 + i * 100,
      priceHigh: 64100 + i * 100,
      volume,
    })),
  ]),
);
const formatPrice = (price: number) =>
  price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const formatVolume = (volume: number) =>
  volume.toLocaleString("en-US", { maximumFractionDigits: 2 });

export function VolumeProfilePreview() {
  const [session, setSession] = useState("today");
  const id = useId();
  const panelId = `${id}-profile`;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLButtonElement) || event.target.getAttribute("role") !== "tab")
      return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const current = tabs.indexOf(event.target);
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (current + direction + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[next].focus();
    const nextValue = tabs[next].dataset.tabsValue;
    if (nextValue) setSession(nextValue);
  };
  return (
    <div className="w-full max-w-xl min-w-0 py-2">
      <Tabs value={session} onValueChange={setSession}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">BTC / USD</p>
            <p className="text-xs text-muted-foreground">Volume by price · Demo data</p>
          </div>
          <TabsList
            aria-label="Profile session"
            onKeyDown={onKeyDown}
            wrapperClassName="w-auto"
            className="bg-muted"
          >
            {sessions.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                id={`${id}-${item.id}`}
                aria-controls={panelId}
                tabIndex={session === item.id ? 0 : -1}
                indicatorClassName="bg-background"
                className="min-h-8 px-3 py-1.5 text-xs [&_[data-tabs-label]]:text-foreground"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div id={panelId} role="tabpanel" aria-labelledby={`${id}-${session}`}>
          <VolumeProfile
            data={data[session]}
            label="BTC volume profile"
            unit="BTC"
            formatPrice={formatPrice}
            formatVolume={formatVolume}
          >
            <VolumeProfilePlot className="h-72 sm:h-80" />
            <VolumeProfileTooltip />
            <VolumeProfileSummary />
          </VolumeProfile>
        </div>
      </Tabs>
    </div>
  );
}
