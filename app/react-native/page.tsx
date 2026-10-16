import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { ComponentCard } from "@/components/app/docs/component-card";
import { InstallCommand } from "@/components/app/docs/install-command";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { NATIVE_PATH, nativeComponentPath } from "@/lib/component-paths";
import { native } from "@/lib/native";
import nativeSlugs from "@/lib/native/slugs.json";
import {
  NATIVE_INDEX_DESCRIPTION,
  NATIVE_INDEX_TITLE,
  nativeIndexJsonLd,
} from "@/lib/native-seo";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-static";

const IMAGE = "/api/og?page=react-native";

export const metadata: Metadata = {
  title: NATIVE_INDEX_TITLE,
  description: NATIVE_INDEX_DESCRIPTION,
  keywords: [
    "react native components",
    "animated react native components",
    "expo components",
    "react native ui library",
    "reanimated components",
    "react native animation",
  ],
  openGraph: {
    title: `${NATIVE_INDEX_TITLE} · beUI`,
    description: NATIVE_INDEX_DESCRIPTION,
    url: NATIVE_PATH,
    siteName: "beUI",
    images: [{ url: IMAGE, width: 1200, height: 630, alt: NATIVE_INDEX_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NATIVE_INDEX_TITLE} · beUI`,
    description: NATIVE_INDEX_DESCRIPTION,
    images: [IMAGE],
  },
  alternates: {
    canonical: NATIVE_PATH,
    types: { "application/json": "/native/r" },
  },
};

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

export default function NativeIndexPage() {
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
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground">React Native</span>
      </nav>
      <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
        Animated React Native components
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Built for touch with Reanimated, Gesture Handler and Uniwind. Copy the
        source into your Expo or React Native app, or try each one on your
        phone in Expo Go.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/docs/native-setup" className={link}>
          Set up your app
        </Link>{" "}
        once, then add any component with the CLI. Or open the whole showcase in{" "}
        <a href={native.expoGo.url} className={link}>
          Expo Go
        </a>{" "}
        (SDK {native.expoGo.sdk}) on your phone.
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
              {name}
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
