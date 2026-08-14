"use client";

import { useState } from "react";
import {
  PixelToast,
  pixelToastPresets,
  usePixelToastPreset,
} from "@/components/motion/pixel-toast";
import { cn } from "@/lib/utils";

export function PixelToastPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const preset = usePixelToastPreset(activeIndex);

  const selectPreset = (index: number) => {
    setActiveIndex(index);
    setStartedAt(Date.now());
  };

  return (
    <div className="flex min-h-80 w-full flex-col items-center justify-center gap-8 bg-[#08080a] px-4 py-8">
      <PixelToast
        key={`${preset.id}-${startedAt}`}
        tone={preset.tone}
        title={preset.title}
        description={preset.description}
        icon={preset.icon}
        action={preset.action}
        duration={preset.duration}
        startedAt={startedAt}
        onDismiss={() => setStartedAt(Date.now())}
      />

      <div className="flex flex-wrap justify-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
        {pixelToastPresets.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectPreset(index)}
            className={cn(
              "h-8 rounded-lg px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100",
              activeIndex === index &&
                "border border-white/[0.08] bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.3)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
