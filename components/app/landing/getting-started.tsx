"use client";

import { Globe, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { InstallCommand } from "@/components/app/docs/install-command";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import nativeSlugs from "@/lib/native/slugs.json";

const TAGLINES = {
  web: "builtOn",
  native: "builtOnNative",
} as const;

type Platform = keyof typeof TAGLINES;

/**
 * The install command for either library. The switch is local to this
 * section, so trying the native command doesn't change the site's platform.
 */
export function GettingStarted() {
  const t = useTranslations("Landing.home");
  const [platform, setPlatform] = useState<Platform>("web");

  return (
    <section
      aria-labelledby="landing-install"
      className="mx-auto max-w-7xl px-4 pb-16 sm:pb-20"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <Tabs
          value={platform}
          onValueChange={(value) => setPlatform(value as Platform)}
          variant="pill"
          icons="selected"
        >
          <TabsList aria-label={t("installFor")}>
            <TabsTrigger value="web" icon={<Globe className="size-3.5" />}>
              {t("web")}
            </TabsTrigger>
            <TabsTrigger value="native" icon={<Smartphone className="size-3.5" />}>
              React Native
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <h2
          id="landing-install"
          className="mt-5 mb-5 text-center text-sm font-normal text-muted-foreground"
        >
          {t(TAGLINES[platform])}
        </h2>
        {platform === "web" ? (
          <InstallCommand className="w-full" />
        ) : (
          <InstallCommand className="w-full" tool="beui-native" slugs={nativeSlugs} />
        )}
      </div>
    </section>
  );
}
