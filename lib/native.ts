// beUI Native, the React Native companion library. Its components, source and
// showcase clips are synced in by scripts/sync-native.ts. The catalog holds
// every file's source, so import this module from server code only.
import catalog from "@/lib/native/catalog.json";

export type NativeTheme = "light" | "dark";

export type NativeFile = { path: string; content: string };

export type NativeClip = { video: string; poster: string };

export type NativeComponent = {
  slug: string;
  title: string;
  description: string;
  group: string;
  variants: number;
  /** The component's folder on GitHub. */
  repository: string;
  /** Libraries the component imports, React and React Native included. */
  libraries: string[];
  /** Opens this component in the published showcase in Expo Go. */
  expoGo: string;
  clips: Record<NativeTheme, NativeClip | null>;
  files: NativeFile[];
  /** Shared hooks, primitives and motion tokens it imports. */
  shared: NativeFile[];
  readme: string | null;
};

export type NativeCatalog = {
  name: string;
  version: string;
  repository: string;
  expoGo: {
    sdk: number;
    projectId: string;
    runtimeVersion: string;
    channel: string;
    url: string;
    qr: string;
  };
  theme: NativeFile;
  components: NativeComponent[];
};

export const native = catalog as NativeCatalog;

/** Native components share their beui.dev slug. */
export function findNativeComponent(slug: string) {
  return native.components.find((component) => component.slug === slug) ?? null;
}

// Present in every React Native app; installing them again would downgrade.
const BUNDLED = new Set(["react", "react-native"]);
// Install with Expo so versions match the app's SDK. Uniwind and Tailwind
// aren't Expo packages and install from npm.
const NPM_ONLY = new Set(["uniwind"]);

/** Install commands for a native component's libraries. */
export function nativeInstallCommands(component: NativeComponent) {
  const libraries = component.libraries.filter((name) => !BUNDLED.has(name));
  // Reanimated 4 needs Worklets even when a component doesn't import it.
  if (
    libraries.includes("react-native-reanimated") &&
    !libraries.includes("react-native-worklets")
  ) {
    libraries.push("react-native-worklets");
  }
  const expo = libraries.filter((name) => !NPM_ONLY.has(name)).sort();
  return [
    expo.length > 0 ? `npx expo install ${expo.join(" ")}` : null,
    // Every component styles with className, which needs Uniwind set up,
    // even when the component never imports it.
    "npm install uniwind tailwindcss",
  ].filter((command): command is string => command !== null);
}
