"use client";

import { useTranslations } from "use-intl";
import { useSiteSound } from "@/components/app/chrome/site-sound";
import { MuteToggle } from "@/components/motion/mute-toggle";
import { Tooltip } from "@/components/motion/tooltip";

/** The header's sound switch: beUI's Mute Toggle, sized like the theme button. */
export function SoundToggle() {
  const t = useTranslations("Chrome.sound");
  const { enabled, setEnabled } = useSiteSound();
  return (
    <Tooltip content={enabled ? t("mute") : t("unmute")} side="bottom">
      <MuteToggle
        muted={!enabled}
        onMutedChange={(muted) => setEnabled(!muted)}
        labels={{ mute: t("label") }}
        className="size-9 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
      />
    </Tooltip>
  );
}
