"use client";

import { type KeyboardEvent, useId, useState } from "react";
import { AspectRatio, AspectRatioImage } from "@/components/motion/aspect-ratio";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

export function AspectRatioUsage() {
  const [value, setValue] = useState("16:9");
  const id = useId();
  const panelId = `${id}-preview`;
  const ratio = value === "16:9" ? 16 / 9 : value === "1:1" ? 1 : 9 / 16;

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
    <Tabs value={value} onValueChange={setValue} className="w-full max-w-md">
      <TabsList aria-label="Aspect ratio" onKeyDown={onKeyDown}>
        {["16:9", "1:1", "9:16"].map((item) => (
          <TabsTrigger key={item} value={item} id={`${id}-${item}`} aria-controls={panelId} tabIndex={value === item ? 0 : -1}>
            {item}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: A media-only tab panel needs a keyboard entry point. */}
      <div id={panelId} role="tabpanel" aria-labelledby={`${id}-${value}`} tabIndex={0} className="mt-6">
        <AspectRatio ratio={ratio} className="bg-muted" style={{ borderRadius: 16 }}>
          <AspectRatioImage
            src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=80"
            alt="A lakeside cabin beneath mountains, reflected in the water"
            width={1000}
            height={667}
          />
        </AspectRatio>
      </div>
    </Tabs>
  );
}
