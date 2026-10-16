import { native } from "@/lib/native";
import {
  BABEL_SNIPPET,
  CLI_SNIPPET,
  CSS_TYPES_SNIPPET,
  GLOBAL_CSS_SNIPPET,
  INSTALL_SNIPPET,
  LAYOUT_SNIPPET,
  LAYOUT_TREE,
  METRO_BARE_SNIPPET,
  METRO_EXPO_SNIPPET,
  NATIVE_VERSIONS,
  SOURCE_SNIPPET,
  USAGE_SNIPPET,
} from "@/lib/native-setup";
import { SITE_URL } from "@/lib/site";

const guides = {
  "motion-patterns": {
    title: "Motion Guides",
    description:
      "Practical guidance for purposeful animation, timing, easing, springs, and accessible motion in React interfaces.",
    body: `## Decision framework

Ask four questions before choosing a duration or spring:

1. **Check frequency.** Repeated actions should feel nearly instant. Save expressive motion for rare moments.
2. **Name the purpose.** Motion should explain space, confirm input, show state, or soften a change.
3. **Choose the physics.** Use ease-out for entrances, ease-in-out for movement, linear motion for progress, and springs for gestures.
4. **Design the fallback.** Reduced motion should keep useful opacity and color feedback while removing travel, scale, parallax, and overshoot.

## Motion tokens

- \`EASE_OUT\`: entrances and exits that respond immediately, then settle quietly.
- \`EASE_IN_OUT\`: objects already on screen moving between positions.
- \`SPRING_PRESS\`: fast, weighted feedback for pressable surfaces.
- \`SPRING_LAYOUT\`: shared surfaces and indicators that preserve spatial continuity.

## Timing

| Interaction | Range | Desired feel |
| --- | --- | --- |
| Press feedback | 100–160ms | Immediate and physical |
| Tooltip or popover | 125–200ms | Quick and origin-aware |
| Dropdown or select | 150–250ms | Responsive, with no waiting |
| Modal or drawer | 200–500ms | Enough time to explain space |
| Marketing demo | Flexible | Clarity matters more than speed |

Under 300ms is the default for interface motion. Longer motion belongs to explanatory demos, deliberate gestures, and large spatial changes.

## Recipes

### Press feedback

Confirm input before the action finishes. Keep the scale change small and the response immediate.

\`\`\`tsx
const reduce = useReducedMotion();

<motion.button
  whileTap={reduce ? undefined : { scale: 0.97 }}
  transition={SPRING_PRESS}
>
  Continue
</motion.button>
\`\`\`

### Semantic icon motion

Let an icon imitate its real action. Gate decorative hover motion behind pointer capability and reduced-motion preferences.

### Content reveal

Reveal one meaningful surface with a short lift and restrained blur. Finish before the surface becomes the focus.

### Layout continuity

Keep the same surface visible while its footprint changes. Move the shape first, then introduce its label.

### Content swap

For small view changes, let old content leave faster than new content arrives. Keep travel to a few pixels.

## Accessibility

Reduced motion is a designed state. Preserve opacity, color, and instant state changes. Remove parallax, large transforms, repeated scale, and spring overshoot.

\`\`\`tsx
const reduce = useReducedMotion();

const hidden = {
  opacity: 0,
  transform: reduce ? "none" : "translateY(8px)",
};

const visible = {
  opacity: 1,
  transform: "translateY(0px)",
};
\`\`\``,
  },
  "ai-agents": {
    title: "Agent Guide",
    description:
      "Install the beUI agent skill, connect the MCP server, or consume the agent-friendly registry endpoints directly.",
    body: `## Agent skill

Install the skill when you want coding agents to choose existing beUI components before inventing custom motion widgets.

\`\`\`bash
npx skills add starc007/ui-components --skill beui
\`\`\`

## MCP server

Connect the hosted beUI MCP server at \`https://mcp.beui.dev/mcp\`.

\`\`\`bash
# Claude Code
claude mcp add --transport http beui https://mcp.beui.dev/mcp

# Codex
codex mcp add beui --url https://mcp.beui.dev/mcp

# Amp
amp mcp add beui https://mcp.beui.dev/mcp
\`\`\`

Manual configuration:

\`\`\`json
{
  "mcpServers": {
    "beui": {
      "type": "http",
      "url": "https://mcp.beui.dev/mcp"
    }
  }
}
\`\`\`

Available tools: \`list_components\`, \`search_components\`, \`get_component\`, and \`get_install_command\`. For React Native apps, \`list_native_components\` and \`get_native_component\` return beUI Native components with every file to copy.

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| \`/llms.txt\` | Markdown discovery index |
| \`/r\` | JSON catalogue of every component |
| \`/r/{slug}\` | Component detail with files, dependencies, and source |
| \`/registry.json\` | shadcn directory-compatible catalogue |
| \`/r/{slug}.json\` | shadcn install item with inline file content |
| \`/r/{slug}/raw\` | Copy-ready plain-text source |
| \`/components/{category}/{slug}.md\` | Component documentation as Markdown |
| \`/native/r\` | JSON catalogue of beUI Native (React Native) components |
| \`/native/r/{slug}\` | Native component detail with install commands and every file |

## Agent flow

1. Fetch \`https://beui.dev/r\` to discover components.
2. Select the closest item by its published name and description.
3. Fetch \`https://beui.dev/r/{slug}\` for source, files, and dependencies.
4. Write every returned file to its declared path.
5. Install the external dependencies from the response.

## shadcn flow

\`\`\`bash
# Official registry namespace
npx shadcn@latest add @beui/animated-toast-stack

# Direct registry URL
npx shadcn@latest add https://beui.dev/r/animated-toast-stack.json
\`\`\`

## Entry shape

Registry entries include the component slug, name, description, category, documentation URLs, package dependencies, internal helpers, and every source file required by the install.

## Generative UI

To let a model compose beUI components into a live interface, follow the [OpenUI integration guide](${SITE_URL}/docs/openui.md).`,
  },
  openui: {
    title: "Use beUI with OpenUI",
    description:
      "Register beUI components with OpenUI, generate the system prompt, stream OpenUI Lang, and render interactive UI.",
    body: `OpenUI lets a model emit an abstract UI tree instead of Markdown. Its React runtime maps every node to a component you register, so generated responses use only the beUI components you allow.

## Install

\`\`\`bash
npm install @openuidev/react-lang @openuidev/lang-core zod
npm install openai
npx shadcn@latest add @beui/button @beui/animated-badge @beui/animated-number
\`\`\`

## Register components

Use \`defineComponent\` to map an OpenUI Lang node to a beUI component. The Zod schema validates streamed model output, while the description teaches the model when to use the component.

\`\`\`tsx
import { defineComponent, useTriggerAction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { Button } from "@/components/motion/button";

const BeButton = defineComponent({
  name: "Button",
  description: "Spring-pressed action button.",
  props: z.object({
    label: z.string(),
    action: z.string(),
  }),
  component: ({ props }) => {
    const triggerAction = useTriggerAction();
    return (
      <Button onClick={() => triggerAction(props.action)}>
        {props.label}
      </Button>
    );
  },
});
\`\`\`

## Assemble the library

\`createLibrary\` collects the definitions, names the root node, and groups components with prompt guidance.

\`\`\`tsx
import { createLibrary } from "@openuidev/react-lang";

export const beuiLibrary = createLibrary({
  root: "Stack",
  components: [Stack, BeButton, BeBadge, BeStat],
});
\`\`\`

## Generate the prompt

Generate a serializable library specification whenever the component library changes:

\`\`\`bash
npx @openuidev/cli@latest generate \\
  --spec ./lib/beui-library.tsx \\
  --out ./lib/generated/beui-library.spec.json
\`\`\`

Pass that specification to \`generateSystemPrompt\` in the server route, then stream the model's OpenUI Lang response to the browser.

## Render the stream

\`\`\`tsx
<Renderer
  response={response}
  library={beuiLibrary}
  isStreaming={isStreaming}
  onAction={(event) => onSend(event.humanFriendlyMessage)}
/>
\`\`\`

## Why beUI fits

beUI components own their files and ship through a shadcn-compatible registry. Generated interfaces inherit the host application's semantic color tokens and use real React controls.

## Resources

- [OpenUI](https://www.openui.com)
- [Defining components](https://www.openui.com/docs/openui-lang/defining-components)
- [shadcn chat example](https://www.openui.com/docs/openui-lang/examples/shadcn-chat)`,
  },
  "native-setup": {
    title: "Set up beUI Native",
    description:
      "One-time setup for beUI Native: install Reanimated, Gesture Handler and Uniwind, configure Metro, add the theme tokens, then copy in any component.",
    body: `beUI Native components are plain source you copy into your app. Do this setup once per app; after that, adding a component is copying its files. It works in Expo and in bare React Native.

## Requirements

| Library | Tested with |
| --- | --- |
${NATIVE_VERSIONS.map((row) => `| [${row.library}](${row.url}) | ${row.version} |`).join("\n")}

## 1. Install the libraries

\`\`\`bash
${INSTALL_SNIPPET}
\`\`\`

Expo's Babel preset already includes the Worklets plugin that Reanimated 4 needs. In a bare React Native app, add it to \`babel.config.js\`:

\`\`\`js
${BABEL_SNIPPET}
\`\`\`

## 2. Set up Uniwind

Create \`global.css\` in the project root:

\`\`\`css
${GLOBAL_CSS_SNIPPET}
\`\`\`

Point Metro at it. \`withUniwindConfig\` must be the outermost wrapper, and \`cssEntryFile\` must be a relative path.

\`\`\`js
${METRO_EXPO_SNIPPET}
\`\`\`

In a bare React Native app, the default config comes from \`@react-native/metro-config\`:

\`\`\`js
${METRO_BARE_SNIPPET}
\`\`\`

Uniwind writes the class name types to \`dtsFile\` when Metro starts. If TypeScript can't find the \`global.css\` import, declare CSS files in \`src/env.d.ts\`:

\`\`\`ts
${CSS_TYPES_SNIPPET}
\`\`\`

## 3. Add the theme tokens

Components use semantic colors defined for light and dark mode. Save this as \`${native.theme.path}\` and change the values to match your brand:

\`\`\`css
${native.theme.content.trim()}
\`\`\`

## 4. Wrap your app

Import \`global.css\` from the root component, not from the file that registers the app. Wrap the app in \`GestureHandlerRootView\`. With Expo Router:

\`\`\`tsx
${LAYOUT_SNIPPET}
\`\`\`

In a bare app, do the same in \`App.tsx\`. For forms, also wrap the app in \`KeyboardProvider\` from [react-native-keyboard-controller](https://docs.expo.dev/versions/v57.0.0/sdk/keyboard-controller/).

## 5. Add a component

Run the beUI Native CLI from the app's root. It copies the component and the shared files it needs into \`src/\` and installs any missing libraries:

\`\`\`bash
${CLI_SNIPPET}
\`\`\`

To copy by hand instead, each component lists its libraries, its files and the shared files it needs, on its page at \`${SITE_URL}/react-native/{slug}\` and at \`${SITE_URL}/native/r/{slug}\`. Keep the folder layout, since components import shared files by relative path. Tabs, for example:

\`\`\`text
${LAYOUT_TREE}
\`\`\`

\`\`\`tsx
${USAGE_SNIPPET}
\`\`\`

Tailwind finds class names under the folder that holds \`global.css\`. If it lives elsewhere, like \`app/\`, add an \`@source\` for the components:

\`\`\`css
${SOURCE_SNIPPET}
\`\`\`

## Try before you copy

Every React Native component page (${SITE_URL}/react-native) has a QR code that opens it in Expo Go (SDK ${native.expoGo.sdk}). Agents can fetch components from ${SITE_URL}/native/r or the beUI MCP server. Every component follows the system Reduce Motion setting and takes a \`disableAnimation\` prop. Source: ${native.repository}`,
  },
} as const;

export type GuideSlug = keyof typeof guides;

export const GUIDE_SLUGS = Object.keys(guides) as GuideSlug[];

export function buildGuideMarkdown(slug: string) {
  const guide = guides[slug as GuideSlug];
  if (!guide) return null;

  const documentation = `${SITE_URL}/docs/${slug}`;
  const markdown = `${documentation}.md`;
  const lines = [
    "---",
    `title: ${JSON.stringify(guide.title)}`,
    `description: ${JSON.stringify(guide.description)}`,
    `documentation: ${JSON.stringify(documentation)}`,
    `markdown: ${JSON.stringify(markdown)}`,
    "---",
    "",
    `# ${guide.title}`,
    "",
    `> ${guide.description}`,
    "",
    guide.body,
    "",
  ];

  return lines.join("\n");
}
