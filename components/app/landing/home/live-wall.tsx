"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "use-intl";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { LandingButton } from "./landing-button";
import { LiveTile } from "./live-tile";
import { SectionHeading } from "./section-heading";
import { WALL_TAGS, type WallTag, type WallTile } from "./wall-picks";

type Filter = "all" | WallTag;

// Tiles reflow on a short tween, not a spring, so a filter change settles
// without wobble.
const REFLOW = { duration: 0.22, ease: EASE_OUT } as const;

/**
 * The landing wall: live components in a dense grid, filtered by how you
 * play with them. The pills filter one grid rather than switching panels, so
 * tiles that stay keep their state and slide to their new place.
 */
export function LiveWall({ tiles, className }: { tiles: WallTile[]; className?: string }) {
  const t = useTranslations("Landing.home.wall");
  const reduce = useReducedMotion() ?? false;
  const [filter, setFilter] = useState<Filter>("all");
  const filters = (["all", ...WALL_TAGS] as const).filter(
    (tag) => tag === "all" || tiles.some((tile) => tile.tags.includes(tag)),
  );
  const shown = filter === "all" ? tiles : tiles.filter((tile) => tile.tags.includes(filter));

  return (
    <section aria-labelledby="landing-wall" className={cn("mx-auto max-w-6xl px-4", className)}>
      <SectionHeading
        id="landing-wall"
        title={t("title")}
        muted={t("titleMuted")}
        action={
          <LandingButton href="/components/motion" variant="outline">
            {t("browseAll")}
            <ArrowRight aria-hidden="true" />
          </LandingButton>
        }
      />

      <Tabs value={filter} onValueChange={setFilter} variant="pill">
        <div className="max-w-full overflow-x-auto">
          <TabsList aria-label={t("filterLabel")}>
            {filters.map((tag) => (
              <TabsTrigger key={tag} value={tag}>
                {t(`filters.${tag}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <div className="mt-5 grid grid-flow-dense grid-cols-1 gap-3 [grid-auto-rows:7.5rem] sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((tile) => (
            <motion.div
              key={tile.key}
              layout={!reduce}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_OUT } }}
              transition={REFLOW}
              className={tile.rows === 3 ? "row-span-3" : "row-span-2"}
            >
              <LiveTile tile={tile} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
