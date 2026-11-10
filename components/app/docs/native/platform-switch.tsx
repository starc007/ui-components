"use client";

import { Globe, Smartphone } from "lucide-react";
import { useTranslations } from "use-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { usePathname, useRouter } from "@/lib/navigation";
import {
  componentPath,
  isNativePath,
  NATIVE_PATH,
  nativeComponentPath,
  TOP_LEVEL_CATEGORIES,
} from "@/lib/component-paths";
import nativeNav from "@/lib/native/nav.json";
import { registry } from "@/lib/registry";

const NATIVE = new Set(nativeNav.map((item) => item.slug));

/**
 * The web page a native component shares its slug with. Charts and Casino
 * pages have no Web/React Native switch, so their slugs don't count.
 */
function webPathFor(slug: string) {
  const category = registry.find(
    (cat) => !TOP_LEVEL_CATEGORIES.includes(cat.slug) && cat.components.some((c) => c.slug === slug),
  );
  return category ? componentPath(category.slug, slug) : "/components/motion";
}

/**
 * The same page on the other platform: a component's counterpart when it
 * has one, otherwise that platform's component list.
 */
function counterpart(pathname: string) {
  if (isNativePath(pathname)) {
    const slug = pathname.slice(NATIVE_PATH.length + 1);
    return slug ? webPathFor(slug) : "/components/motion";
  }
  const slug = pathname.match(/^\/components\/[^/]+\/([^/]+)/)?.[1];
  return slug && NATIVE.has(slug) ? nativeComponentPath(slug) : NATIVE_PATH;
}

const trigger = "w-full justify-center";

/**
 * Moves between a page's web and React Native versions, which live at their
 * own URLs. The `block` layout fills its container, for the sidebar. Only the
 * selected platform carries its icon.
 */
export function PlatformSwitch({
  layout = "inline",
  className,
}: {
  layout?: "inline" | "block";
  className?: string;
}) {
  const t = useTranslations("Native.platform");
  const pathname = usePathname();
  const router = useRouter();
  const platform = isNativePath(pathname) ? "native" : "web";
  const block = layout === "block";

  return (
    <Tabs
      value={platform}
      onValueChange={(value) => {
        if (value !== platform) router.push(counterpart(pathname));
      }}
      variant="pill"
      icons="selected"
      className={className}
    >
      <TabsList aria-label={t("label")} className={block ? "grid w-full grid-cols-2" : undefined}>
        <TabsTrigger
          value="web"
          icon={<Globe className="size-3.5" />}
          className={block ? trigger : undefined}
        >
          {t("web")}
        </TabsTrigger>
        <TabsTrigger
          value="native"
          icon={<Smartphone className="size-3.5" />}
          className={block ? trigger : undefined}
        >
          React Native
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
