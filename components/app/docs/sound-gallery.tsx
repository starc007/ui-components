"use client";

import { VolumeX } from "lucide-react";
import { useTranslations } from "use-intl";
import { useSiteSound } from "@/components/app/chrome/site-sound";
import { InstallCommand } from "@/components/app/docs/install-command";
import { SoundBoard } from "@/components/previews/sounds/sound-board";
import { componentPath } from "@/lib/component-paths";
import { Link } from "@/lib/navigation";
import { findComponent } from "@/lib/registry";

/**
 * Every sound as a pad you press or play from the keyboard, with the kit's
 * install command on top. Each name links to the sound's own page.
 */
export function SoundGallery() {
  const t = useTranslations("Docs.category.sounds");
  const { enabled, setEnabled } = useSiteSound();

  return (
    <section className="mt-8 flex flex-col items-center gap-6">
      <InstallCommand slug="sound-kit" className="w-full max-w-md" />
      {/* One fixed-height slot: the muted notice replaces the keys hint, so
          the grid never moves when the stored setting loads. */}
      <div className="flex h-8 items-center">
        {enabled ? (
          <p className="hidden text-sm text-muted-foreground sm:block">{t("keysHint")}</p>
        ) : (
          <button
            type="button"
            onClick={() => setEnabled(true)}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <VolumeX aria-hidden="true" className="size-4" />
            {t("muted")}
          </button>
        )}
      </div>
      <SoundBoard
        className="w-full"
        renderName={(item) =>
          findComponent("sounds", item.slug) ? (
            <Link
              href={componentPath("sounds", item.slug)}
              className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.name}
            </Link>
          ) : (
            <span>{item.name}</span>
          )
        }
      />
    </section>
  );
}
