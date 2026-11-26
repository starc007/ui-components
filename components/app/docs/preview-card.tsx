"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import type { HighlightedCode } from "@/lib/highlight";
import { cn } from "@/lib/utils";
import { CODE_BODY_CLASS } from "./code-block";
import { CopyButton } from "./copy-button";
import {
  PreviewExpand,
  PreviewExpandStage,
  PreviewExpandToggle,
  PreviewReplayToggle,
} from "./preview-fullscreen";

// Folded code shows about five lines: 5 × 23px (13px at leading-relaxed) plus
// the body's 16px top and bottom padding.
const FOLDED_HEIGHT = 148;

const TRIGGER_CLASS =
  "px-3 py-1 text-xs aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground";

/**
 * One example: a framed card with the demo on a stage and its code folded
 * underneath. The frame is rounded-3xl with p-2, so both inner panels are
 * rounded-2xl (24 − 8 = 16).
 */
export function PreviewCard({
  stageId,
  minHeight,
  preview,
  usage,
  source,
}: {
  stageId: string;
  minHeight: string;
  preview: ReactNode;
  usage: HighlightedCode;
  source: HighlightedCode;
}) {
  const t = useTranslations("Docs.component");
  const [tab, setTab] = useState("usage");
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const code = tab === "usage" ? usage : source;

  return (
    <PreviewExpand stageId={stageId}>
      <div className="flex flex-col gap-2 rounded-3xl bg-card p-2">
        <div className="relative">
          <PreviewExpandStage
            className={cn(
              "flex items-center justify-center rounded-2xl bg-background px-4 py-12",
              "data-[expanded]:rounded-none",
              minHeight,
            )}
          >
            {preview}
          </PreviewExpandStage>
          <div className="absolute top-3 right-3 flex gap-1.5">
            <PreviewReplayToggle className="size-8" />
            <PreviewExpandToggle className="size-8" />
          </div>
        </div>

        <div className="relative rounded-2xl bg-background">
          <Tabs value={tab} onValueChange={setTab} variant="pill">
            <div className="p-2 pb-0">
              <TabsList className="bg-card">
                <TabsTrigger value="usage" indicatorClassName="bg-background" className={TRIGGER_CLASS}>
                  {t("usage")}
                </TabsTrigger>
                <TabsTrigger value="source" indicatorClassName="bg-background" className={TRIGGER_CLASS}>
                  {t("code")}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="usage" className="mt-0 rounded-2xl">
              <CodeBody id={`${bodyId}-usage`} html={usage.html} open={open} onToggle={() => setOpen((o) => !o)} />
            </TabsContent>
            <TabsContent value="source" className="mt-0 rounded-2xl">
              <CodeBody id={`${bodyId}-source`} html={source.html} open={open} onToggle={() => setOpen((o) => !o)} />
            </TabsContent>
          </Tabs>
          {/* Outside the Tabs root: its MotionConfig and layoutRoot would drive
              the button's hover scale and icon swap too. */}
          <div className="absolute top-2 right-2">
            <CopyButton text={code.code} eventLabel={code.filename ?? stageId} />
          </div>
        </div>
      </div>
    </PreviewExpand>
  );
}

function CodeBody({
  id,
  html,
  open,
  onToggle,
}: {
  id: string;
  html: string;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("Docs.component");
  const ref = useRef<HTMLDivElement>(null);
  // Unknown until measured; folded by default so server HTML matches the
  // common case (most code is longer than five lines).
  const [foldable, setFoldable] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setFoldable(el.scrollHeight > FOLDED_HEIGHT + 24);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const folded = !open && foldable !== false;

  return (
    <div className="relative">
      <div
        ref={ref}
        id={id}
        className={cn(
          CODE_BODY_CLASS,
          folded ? "overflow-hidden" : "max-h-[640px] overflow-auto",
        )}
        style={folded ? { maxHeight: FOLDED_HEIGHT } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {foldable ? (
        <div
          className={cn(
            "flex justify-center pb-3",
            folded &&
              "pointer-events-none absolute inset-x-0 bottom-0 h-20 items-end bg-gradient-to-t from-background via-background/80 to-transparent",
          )}
        >
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!folded}
            aria-controls={id}
            className="pointer-events-auto inline-flex h-7 items-center gap-1 rounded-full bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {folded ? t("viewCode") : t("hideCode")}
            <ChevronDown
              aria-hidden="true"
              className={cn("size-3.5 transition-transform duration-200", !folded && "rotate-180")}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
