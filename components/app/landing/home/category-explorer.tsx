"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { LandingButton } from "./landing-button";
import type { LandingEntry } from "./landing-data";
import { PreviewTile } from "./preview-tile";

export type ExplorerCategory = {
  slug: string;
  name: string;
  href: string;
  count: number;
  entries: LandingEntry[];
};

/**
 * One tab per library section, each showing up to eight live tiles. The grid
 * reserves two rows on every tab, so a short section like Casino keeps the
 * page height and the tab bar never jumps.
 */
export function CategoryExplorer({ categories }: { categories: ExplorerCategory[] }) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");

  return (
    <Tabs value={active} onValueChange={setActive} variant="pill">
      <div className="flex flex-col items-center gap-4">
        <div className="max-w-full overflow-x-auto">
          <TabsList aria-label="Library sections">
            {categories.map((category) => (
              <TabsTrigger key={category.slug} value={category.slug} className="text-[13px]">
                {category.name}
                {/* Inherits the label color, so it stays legible on the selected pill. */}
                <span className="ml-1.5 font-mono text-[11px] tabular-nums opacity-60">
                  {category.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
      {categories.map((category) => (
        <TabsContent key={category.slug} value={category.slug} className="mt-6 rounded-2xl">
          <div className="grid grid-cols-1 gap-3 [grid-auto-rows:15rem] sm:grid-cols-2 lg:min-h-[30.75rem] lg:grid-cols-4">
            {category.entries.slice(0, 8).map(({ category: slug, component }) => (
              <PreviewTile key={component.slug} category={slug} component={component} />
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <LandingButton href={category.href} variant="outline">
              All {category.count} in {category.name}
              <ArrowRight aria-hidden="true" />
            </LandingButton>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
