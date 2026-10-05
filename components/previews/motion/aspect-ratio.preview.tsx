"use client";

import { type KeyboardEvent, useId, useState } from "react";
import { AspectRatio, AspectRatioImage } from "@/components/motion/aspect-ratio";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

const RATIOS = [
  { label: "21:9", value: 21 / 9 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:2", value: 3 / 2 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:4", value: 3 / 4 },
  { label: "2:3", value: 2 / 3 },
  { label: "9:16", value: 9 / 16 },
] as const;

export function AspectRatioPreview() {
  const [value, setValue] = useState("16:9");
  const id = useId();
  const panelId = `${id}-preview`;
  const ratio = RATIOS.find((item) => item.label === value)?.value ?? 16 / 9;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement) || event.target.getAttribute("role") !== "tab") return;
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const index = tabs.indexOf(event.target as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + direction + tabs.length) % tabs.length;
    event.preventDefault();
    const tab = tabs[next];
    const nextValue = tab?.dataset.tabsValue;
    if (!nextValue) return;
    tab.focus();
    setValue(nextValue);
  };

  return (
    <div className="mx-auto w-full max-w-xl min-w-0 px-4 py-6">
      <Tabs value={value} onValueChange={setValue}>
        <TabsList aria-label="Aspect ratio" onKeyDown={onKeyDown} className="mx-auto bg-muted">
          {RATIOS.map((item) => (
            <TabsTrigger
              key={item.label}
              value={item.label}
              id={`${id}-${item.label}`}
              aria-controls={panelId}
              tabIndex={value === item.label ? 0 : -1}
              indicatorClassName="bg-background"
              className="min-h-9 px-3 text-xs [&_[data-tabs-label]]:text-foreground"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: A media-only tab panel needs a keyboard entry point. */}
        <div id={panelId} role="tabpanel" aria-labelledby={`${id}-${value}`} tabIndex={0} className="mt-6 flex h-[25rem] w-full items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <AspectRatio
            ratio={ratio}
            className="bg-muted"
            style={{ maxWidth: Math.min(440, 360 * ratio), borderRadius: 16 }}
          >
            <AspectRatioImage
              src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=80"
              alt="A lakeside cabin beneath mountains, reflected in the water"
              width={1000}
              height={667}
            />
          </AspectRatio>
        </div>
      </Tabs>
    </div>
  );
}
