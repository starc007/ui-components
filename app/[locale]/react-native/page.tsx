import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { ComponentCard } from "@/components/app/docs/component-card";
import { InstallCommand } from "@/components/app/docs/install-command";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { localeAlternates } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { LANGUAGES, routing } from "@/i18n/routing";
import { NATIVE_PATH, nativeComponentPath } from "@/lib/component-paths";
import { native } from "@/lib/native";
import nativeSlugs from "@/lib/native/slugs.json";
import { nativeIndexJsonLd } from "@/lib/native-seo";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-static";

const IMAGE = "/api/og?page=react-native";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Native.index" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const alternates = localeAlternates(NATIVE_PATH, locale);
  return {
    title,
    description,
    keywords: [
      "react native components",
      "animated react native components",
      "expo components",
      "react native ui library",
      "reanimated components",
      "react native animation",
    ],
    openGraph: {
      title: `${title} · beUI`,
      description,
      url: alternates.canonical,
      locale: LANGUAGES[locale].og,
      siteName: "beUI",
      images: [{ url: IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · beUI`,
      description,
      images: [IMAGE],
    },
    alternates: {
      ...alternates,
      types: { "application/json": "/native/r" },
    },
  };
}

const link =
  "text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground";

/** Native components grouped as the catalog groups them, in catalog order. */
function groups() {
  const byName = new Map<string, typeof native.components>();
  for (const component of native.components) {
    const group = byName.get(component.group) ?? [];
    group.push(component);
    byName.set(component.group, group);
  }
  return [...byName.entries()];
}

const groupId = (name: string) =>
  `native-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export default async function NativeIndexPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Native.index");
  const groupNames: Record<string, string> = (await getMessages()).Chrome.sidebar.nativeGroups;
  return (
    <div>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "beUI", path: "/" },
            { name: "React Native", path: NATIVE_PATH },
          ]),
          nativeIndexJsonLd(),
        ]}
      />
      <nav aria-label={t("breadcrumb")} className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground">React Native</span>
      </nav>
      <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
        {t("heading")}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {t("intro")}
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {t.rich("setup", {
          link: (chunks) => (
            <Link href="/docs/native-setup" className={link}>
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div className="mt-6 xl:hidden">
        <PlatformSwitch />
      </div>
      <InstallCommand tool="beui-native" slugs={nativeSlugs} className="mt-6 max-w-2xl" />

      <div className="mt-12 space-y-12">
        {groups().map(([name, components]) => (
          <section key={name} aria-labelledby={groupId(name)}>
            <h2
              id={groupId(name)}
              className="font-display text-xs font-medium uppercase text-muted-foreground"
            >
              {groupNames[name] ?? name}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {components.map((component) => (
                <ComponentCard
                  key={component.slug}
                  categorySlug="motion"
                  slug={component.slug}
                  name={component.title}
                  description={component.description}
                  href={nativeComponentPath(component.slug)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
