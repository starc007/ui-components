"use client";

import { FileImage } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip } from "@/components/motion/tooltip";
import { SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import type { Translate } from "./messages";
import type { AttachmentUploadItem } from "./types";
import { imageSource } from "./utils";

export function ImageThumbnail({
  item,
  layoutId,
  onPreview,
  reduce,
  t,
}: {
  item: AttachmentUploadItem;
  layoutId?: string;
  onPreview: (item: AttachmentUploadItem) => void;
  reduce: boolean;
  t: Translate;
}) {
  const src = imageSource(item);

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
      >
        <FileImage className="size-4" />
      </span>
    );
  }

  return (
    <Tooltip
      side="top"
      delay={160}
      className="rounded-2xl p-1 shadow-xl"
      content={
        <span className="block w-32">
          <img
            src={src}
            alt=""
            className="h-20 w-full rounded-xl object-cover"
          />
          <span className="block px-1 pb-0.5 pt-1 text-center text-[11px] font-medium text-muted-foreground">
            {t("clickToPreview")}
          </span>
        </span>
      }
    >
      <motion.button
        type="button"
        aria-label={t("preview", { name: item.name })}
        onClick={(event) => {
          event.currentTarget.blur();
          onPreview(item);
        }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={SPRING_PRESS}
        className="group/image relative size-9 shrink-0 overflow-hidden rounded-[10px] bg-muted outline-none ring-1 ring-border/70 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <motion.img
          layoutId={layoutId}
          src={src}
          alt=""
          className="size-full object-cover"
          transition={{ layout: SPRING_LAYOUT }}
        />
      </motion.button>
    </Tooltip>
  );
}
