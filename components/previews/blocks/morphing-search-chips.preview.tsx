"use client";

import { MorphingSearchChips } from "@/components/motion/morphing-search-chips";

const tiles = [
  "from-rose-400/40 to-orange-300/30",
  "from-sky-400/40 to-indigo-400/30",
  "from-emerald-400/40 to-teal-300/30",
  "from-amber-300/40 to-rose-300/30",
  "from-violet-400/40 to-fuchsia-300/30",
  "from-teal-300/40 to-sky-300/30",
];

export function MorphingSearchChipsPreview() {
  return (
    <div className="relative flex h-[440px] w-full max-w-2xl flex-col justify-end overflow-hidden rounded-3xl border border-border bg-muted/40 p-4">
      <div aria-hidden="true" className="absolute inset-4 grid grid-cols-3 gap-3 opacity-80">
        {tiles.map((tile) => (
          <div key={tile} className={`rounded-2xl bg-gradient-to-br ${tile}`} />
        ))}
      </div>
      <MorphingSearchChips
        className="mx-auto"
        placeholder="Search inspiration"
        label="Search inspiration"
        defaultChips={["onboarding"]}
        defaultRecents={["dashboards", "empty states", "pricing pages"]}
        storageKey="beui:morphing-search-chips:recents"
        maxChips={4}
        suggestions={[
          "dashboards",
          "data tables",
          "dark mode",
          "empty states",
          "onboarding",
          "pricing pages",
          "settings",
          "sign in",
        ]}
      />
    </div>
  );
}
