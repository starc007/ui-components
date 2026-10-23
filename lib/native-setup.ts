// One-time app setup for beUI Native. The guide page and its Markdown twin
// both read these, so the two never drift apart.

export const NATIVE_SETUP_PATH = "/docs/native-setup";

/** Versions the components are built and tested against. */
export const NATIVE_VERSIONS: { library: string; url: string; version: string }[] = [
  { library: "Expo SDK, React Native", url: "https://docs.expo.dev", version: "57, 0.86 with React 19" },
  { library: "Reanimated and Worklets", url: "https://docs.swmansion.com/react-native-reanimated/", version: "4.5 and 0.10" },
  { library: "Gesture Handler", url: "https://docs.swmansion.com/react-native-gesture-handler/", version: "2.32" },
  { library: "Uniwind with Tailwind CSS", url: "https://docs.uniwind.dev", version: "1.12 with 4.3" },
];

export const INSTALL_SNIPPET = `npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler
npm install uniwind tailwindcss`;

export const BABEL_SNIPPET = `module.exports = {
  presets: ["module:@react-native/babel-preset"],
  // Reanimated 4 runs animations as worklets. Keep this plugin last.
  plugins: ["react-native-worklets/plugin"],
};`;

export const GLOBAL_CSS_SNIPPET = `@import "tailwindcss";
@import "uniwind";
@import "./src/styles/theme.css";`;

export const METRO_EXPO_SNIPPET = `const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// Uniwind must be the outermost wrapper.
module.exports = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});`;

export const METRO_BARE_SNIPPET = `const { getDefaultConfig } = require("@react-native/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// Uniwind must be the outermost wrapper.
module.exports = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});`;

export const CSS_TYPES_SNIPPET = `declare module "*.css";`;

export const LAYOUT_SNIPPET = `import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
    </GestureHandlerRootView>
  );
}`;

export const SOURCE_SNIPPET = `@import "tailwindcss";
@import "uniwind";
@import "../src/styles/theme.css";

/* This file is in app/, so the components in src/ need an explicit source. */
@source "../src";`;

export const CLI_SNIPPET = "npx beui-native add tabs";

export const LAYOUT_TREE = `global.css
metro.config.js
src/
  components/
    tabs/
      index.ts
      tabs.tsx
  hooks/
    use-reduced-motion.ts
  primitives/
    render-icon.tsx
  styles/
    motion.ts
    theme.css`;

export const USAGE_SNIPPET = `import { Text } from "react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/components/tabs";

export default function Screen() {
  return (
    <Tabs defaultValue="overview" className="p-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Text className="text-foreground">High-level summary.</Text>
      </TabsContent>
      <TabsContent value="activity">
        <Text className="text-foreground">Recent events.</Text>
      </TabsContent>
    </Tabs>
  );
}`;
