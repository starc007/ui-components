// JSON for the beUI Native endpoints at /native/r, read by agents and the MCP
// server. Kept apart from /r, whose shape is the public shadcn contract.
import { nativeComponentPath } from "@/lib/component-paths";
import {
  findNativeComponent,
  native,
  nativeInstallCommands,
  type NativeComponent,
} from "@/lib/native";
import { SITE_URL } from "@/lib/site";

export const NATIVE_HEADERS = {
  "cache-control": "public, max-age=300, s-maxage=3600",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
};

const SETUP = [
  "Quickest: run `npx beui-native add <slug>` from the app's root. It writes the files below and installs the libraries.",
  "Copy the files into the app and keep their folder layout: components import the shared files by relative path.",
  "Add the theme tokens once, imported after Tailwind and Uniwind in the CSS file Uniwind reads.",
  "Wrap the app in GestureHandlerRootView if it uses react-native-gesture-handler and isn't already.",
  "Works in Expo and in bare React Native. Every component honors the system Reduce Motion setting.",
];

/** A native component's page on beui.dev. */
const pageUrl = (slug: string) => `${SITE_URL}${nativeComponentPath(slug)}`;

const detailUrl = (slug: string) => `${SITE_URL}/native/r/${slug}`;

function summary(component: NativeComponent) {
  return {
    slug: component.slug,
    name: component.title,
    description: component.description,
    group: component.group,
    detail_url: detailUrl(component.slug),
    page_url: pageUrl(component.slug),
    expo_go_url: component.expoGo,
  };
}

export function buildNativeIndex() {
  return {
    name: native.name,
    description:
      "Animated, accessible React Native components built for touch: the native companion to beUI, on Reanimated, Gesture Handler and Uniwind. Copy the source into your app.",
    version: native.version,
    repository: native.repository,
    endpoints: {
      index: `${SITE_URL}/native/r`,
      detail: `${SITE_URL}/native/r/{slug}`,
    },
    expo_go: {
      sdk: native.expoGo.sdk,
      url: native.expoGo.url,
      qr: native.expoGo.qr,
    },
    setup: SETUP,
    components: native.components.map(summary),
  };
}

export function buildNativeEntry(slug: string) {
  const component = findNativeComponent(slug);
  if (!component) return null;
  return {
    ...summary(component),
    source_url: component.repository,
    libraries: component.libraries,
    install: nativeInstallCommands(component),
    setup: SETUP,
    files: [
      ...component.files.map((file) => ({ ...file, type: "component" })),
      ...component.shared.map((file) => ({ ...file, type: "shared" })),
      { ...native.theme, type: "theme" },
    ],
  };
}
