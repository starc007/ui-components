"use client";

import { Bell, Download } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { AddToCart } from "@/components/motion/add-to-cart";
import { AnimatedToastStack, useAnimatedToastStack } from "@/components/motion/animated-toast-stack";
import { BookmarkButton } from "@/components/motion/bookmark-button";
import { Button } from "@/components/motion/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/motion/dropdown-menu";
import { FollowButton } from "@/components/motion/follow-button";
import { LikeButton } from "@/components/motion/like-button";
import { PollVote } from "@/components/motion/poll-vote";
import { RangeSlider } from "@/components/motion/range-slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { SendButton } from "@/components/motion/send-button";
import { StarRating } from "@/components/motion/star-rating";
import { Switch } from "@/components/motion/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";

/** One tile: the site's card frame, a stage for the components and a label. */
function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    // A flex column, so the stage's top margin stays inside the card instead
    // of collapsing through it.
    <section className="mb-4 flex break-inside-avoid flex-col rounded-3xl bg-card">
      <div className="m-2 mb-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-background px-5 py-8">
        {children}
      </div>
      <h2 className="px-4 py-3.5 font-display text-sm font-medium tracking-tight text-foreground">
        {label}
      </h2>
    </section>
  );
}

/**
 * Real beUI components, unchanged, so the board shows exactly what a theme
 * does to them. Everything reads the page's tokens, including menus and
 * toasts that render outside the board.
 */
export function ThemeBoard() {
  const t = useTranslations("Pages.themes.board");
  const [notify, setNotify] = useState(true);
  const [sync, setSync] = useState(false);
  const [plan, setPlan] = useState("pro");
  const [sort, setSort] = useState("recent");
  const { toasts, showToast, dismissToast } = useAnimatedToastStack({ defaultDuration: 3200, limit: 3 });

  return (
    <div className="columns-1 gap-4 md:columns-2 2xl:columns-3">
      <Tile label={t("buttons")}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button sound variant="primary">
            {t("continue")}
          </Button>
          <Button sound variant="secondary">
            <Download className="size-4" />
            {t("download")}
          </Button>
          <Button sound variant="outline">
            {t("outline")}
          </Button>
          <Button sound variant="ghost">
            {t("ghost")}
          </Button>
        </div>
      </Tile>

      <Tile label={t("settings")}>
        <div className="flex w-full max-w-64 flex-col gap-3">
          <Switch sound checked={notify} onCheckedChange={setNotify} label={t("notifications")} />
          <Switch sound checked={sync} onCheckedChange={setSync} label={t("sync")} />
        </div>
        <div className="w-full max-w-64">
          <RangeSlider sound defaultValue={60} step={5} aria-label={t("volume")} />
        </div>
      </Tile>

      <Tile label={t("tabs")}>
        <Tabs sound defaultValue="overview" variant="pill">
          <TabsList>
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="activity">{t("activity")}</TabsTrigger>
            <TabsTrigger value="billing">{t("billing")}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-2 text-center text-sm text-muted-foreground">
            {t("overviewBody")}
          </TabsContent>
          <TabsContent value="activity" className="pt-2 text-center text-sm text-muted-foreground">
            {t("activityBody")}
          </TabsContent>
          <TabsContent value="billing" className="pt-2 text-center text-sm text-muted-foreground">
            {t("billingBody")}
          </TabsContent>
        </Tabs>
      </Tile>

      <Tile label={t("reactions")}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <LikeButton sound count={128} />
          <BookmarkButton sound />
          <FollowButton sound />
        </div>
        <StarRating sound defaultValue={4} size={24} />
      </Tile>

      <Tile label={t("menus")}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="w-44">
            <Select sound value={plan} onValueChange={setPlan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">{t("planFree")}</SelectItem>
                <SelectItem value="pro">{t("planPro")}</SelectItem>
                <SelectItem value="team">{t("planTeam")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu sound>
            <DropdownMenuTrigger>
              <Button variant="outline">{t("sort")}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                <DropdownMenuRadioItem value="recent">{t("sortRecent")}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="popular">{t("sortPopular")}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t("export")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Tile>

      <Tile label={t("checkout")}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <AddToCart sound />
          <SendButton sound />
        </div>
      </Tile>

      <Tile label={t("poll")}>
        <div className="w-full max-w-72">
          <PollVote
            sound
            options={[
              { id: "springs", label: t("pollSprings"), votes: 42 },
              { id: "curves", label: t("pollCurves"), votes: 27 },
              { id: "both", label: t("pollBoth"), votes: 31 },
            ]}
          />
        </div>
      </Tile>

      <Tile label={t("toast")}>
        <AnimatedToastStack
          sound
          toasts={toasts}
          onDismiss={dismissToast}
          position="bottom-right"
          placement="fixed"
          maxVisible={3}
        />
        <Button
          sound
          variant="secondary"
          onClick={() =>
            showToast({ status: "success", title: t("toastTitle"), description: t("toastBody") })
          }
        >
          <Bell className="size-4" />
          {t("showToast")}
        </Button>
      </Tile>
    </div>
  );
}
