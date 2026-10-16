// Search metadata and structured data for the beUI Native pages under
// /react-native. Reads the catalog, so import from server code only.
import { NATIVE_PATH, nativeComponentPath } from "@/lib/component-paths";
import { type NativeComponent, native } from "@/lib/native";
import { AUTHOR, clampText, SITE_NAME } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// When beUI Native launched on beui.dev; the components share this date.
const NATIVE_PUBLISHED = "2026-10-16";

const abs = (path: string) => `${SITE_URL}${path}`;

export const NATIVE_INDEX_TITLE = "Animated React Native Components";
export const NATIVE_INDEX_DESCRIPTION =
  "Free, open-source animated components for React Native and Expo, built for touch with Reanimated, Gesture Handler and Uniwind. Copy the source or install with npx beui-native.";

/** A component page's title, without the site name. */
export function nativeTitle(component: NativeComponent) {
  return `${component.title} · Animated React Native component`;
}

export function nativeMetaDescription(component: NativeComponent) {
  return clampText(
    `${component.description} An animated, accessible React Native component for Expo and bare apps, built with Reanimated.`,
    160,
  );
}

export function nativeComponentJsonLd(component: NativeComponent) {
  const url = abs(nativeComponentPath(component.slug));
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: nativeTitle(component),
    name: component.title,
    description: component.description,
    url,
    image: abs(`/api/og?native=${component.slug}`),
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    datePublished: NATIVE_PUBLISHED,
    author: {
      "@type": "Person",
      name: AUTHOR,
      url: "https://saura3h.xyz",
      sameAs: "https://github.com/starc007",
    },
    publisher: { "@id": `${SITE_URL}/#org` },
    about: {
      "@type": "SoftwareSourceCode",
      name: component.title,
      description: component.description,
      codeRepository: native.repository,
      license: `${native.repository}/blob/main/LICENSE`,
      programmingLanguage: "TypeScript",
      runtimePlatform: "React Native",
      codeSampleType: "full (compile ready)",
    },
  };
}

/** The index page: a CollectionPage listing every native component. */
export function nativeIndexJsonLd() {
  const url = abs(NATIVE_PATH);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: `${NATIVE_INDEX_TITLE} · ${SITE_NAME}`,
    description: NATIVE_INDEX_DESCRIPTION,
    url,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: native.components.length,
      itemListElement: native.components.map((component, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: component.title,
        url: abs(nativeComponentPath(component.slug)),
      })),
    },
  };
}
