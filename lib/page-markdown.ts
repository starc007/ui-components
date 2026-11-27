// Markdown twins for the pages that have no component or guide behind them:
// the React Native pages, list pages, site pages and legal pages. Each one is
// written to `<page path>.md` by scripts/build-static.ts, and each page links
// it with rel="alternate" type="text/markdown". Build scripts only: it reads
// the native catalog and every message file.
import { messages } from "@/i18n/messages";
import { BLOG_FEED_PATH, BLOG_PATH, blogPostPath, blogPosts } from "@/lib/blog";
import { CHANGE_LABELS, CHANGELOG_FEED_PATH, CHANGELOG_PATH, changelogEntries, changelogItemLink } from "@/lib/changelog";
import { componentPath, NATIVE_PATH, nativeComponentPath } from "@/lib/component-paths";
import { type NativeComponent, native, nativeInstallCommands } from "@/lib/native";
import nav from "@/lib/native/nav.json";
import { NATIVE_INDEX_DESCRIPTION, NATIVE_INDEX_TITLE } from "@/lib/native-seo";
import { allComponents } from "@/lib/registry";
import { seoPagePath, seoPages } from "@/lib/seo-pages";
import type { SeoPageKind } from "@/lib/seo-pages/types";
import { SITE_URL } from "@/lib/site";
import {
  DIAMOND_SPONSORS,
  GITHUB_SPONSORS_URL,
  SPONSOR_EVM_ADDRESS,
  SPONSOR_PLANS,
  SPONSOR_SOL_ADDRESS,
  type SponsorTier,
} from "@/lib/sponsors-config";

const url = (path: string) => `${SITE_URL}${path}`;
const quote = (value: string) => JSON.stringify(value);

/** Frontmatter, title and summary line, the same opening as the docs guides. */
function page(path: string, title: string, description: string, body: string[]) {
  return [
    "---",
    `title: ${quote(title)}`,
    `description: ${quote(description)}`,
    `documentation: ${quote(url(path))}`,
    `markdown: ${quote(url(`${path}.md`))}`,
    "---",
    "",
    `# ${title}`,
    "",
    `> ${description}`,
    "",
    ...body,
    "",
  ].join("\n");
}

/** Pushes a README's headings down one level so its own title sits under the page's. */
function nestHeadings(markdown: string) {
  let inFence = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (line.startsWith("```")) inFence = !inFence;
      return !inFence && /^#{1,5} /.test(line) ? `#${line}` : line;
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// React Native

/** /react-native: every native component, grouped like the page and sidebar. */
export function nativeIndexMarkdown() {
  const groupNames: Record<string, string> = messages.Chrome.sidebar.nativeGroups;
  const groups = [...new Set(nav.map((item) => item.group))];
  const body = [
    `Install one with \`npx beui-native add <slug>\` after the one-time setup: ${url("/docs/native-setup.md")}. Registry JSON: ${url("/native/r")}`,
  ];
  for (const group of groups) {
    body.push("", `## ${groupNames[group] ?? group}`, "");
    for (const item of nav.filter((entry) => entry.group === group)) {
      const component = native.components.find((entry) => entry.slug === item.slug);
      if (!component) continue;
      body.push(`- [${component.title}](${url(`${nativeComponentPath(component.slug)}.md`)}): ${component.description} Install: \`${component.slug}\``);
    }
  }
  return page(NATIVE_PATH, NATIVE_INDEX_TITLE, NATIVE_INDEX_DESCRIPTION, body);
}

/** /react-native/<slug>: install, links and the component's README. */
export function nativeComponentMarkdown(component: NativeComponent) {
  const path = nativeComponentPath(component.slug);
  const web = allComponents().find((entry) => entry.slug === component.slug);
  const body = [
    `React Native component for Expo, from beUI Native. Group: ${component.group}. Variants: ${component.variants}.`,
    "",
    "## Install",
    "",
    `Set up beUI Native once per app first: ${url("/docs/native-setup.md")}`,
    "",
    "```bash",
    `npx beui-native add ${component.slug}`,
    "```",
    "",
    "Or copy the source by hand and install its libraries:",
    "",
    "```bash",
    ...nativeInstallCommands(component),
    "```",
    "",
    "## Links",
    "",
    `- Source: ${component.repository}`,
    `- Registry JSON with every file: ${url(`/native/r/${component.slug}`)}`,
    `- Open in Expo Go: ${component.expoGo}`,
    ...(web ? [`- Web version: ${url(`${componentPath(web.category.slug, web.slug)}.md`)}`] : []),
  ];
  if (component.readme) body.push("", "## README", "", nestHeadings(nestHeadings(component.readme.trim())));
  return page(path, component.title, component.description, body);
}

// ---------------------------------------------------------------------------
// List pages

/** /blog: every published post, newest first. */
export function blogIndexMarkdown() {
  const copy = messages.Native.blog;
  const body = [
    `RSS: ${url(BLOG_FEED_PATH)}`,
    "",
    ...blogPosts().map((post) => `- [${post.title}](${url(`${blogPostPath(post.slug)}.md`)}) (${post.publishedAt}): ${post.description}`),
  ];
  return page(BLOG_PATH, copy.title, copy.description, body);
}

/** /guides and /alternatives: every page of that kind. */
export function seoIndexMarkdown(kind: SeoPageKind) {
  const copy = messages.Native.seoIndex[kind];
  const body = [
    copy.intro,
    "",
    ...seoPages(kind).map((entry) => `- [${entry.heading}](${url(`${seoPagePath(kind, entry.slug)}.md`)}): ${entry.description}`),
  ];
  return page(`/${kind}`, copy.title, copy.description, body);
}

/** /changelog: every release, newest first, with links to what changed. */
export function changelogMarkdown() {
  const copy = messages.Native.changelog;
  const body = [`RSS: ${url(CHANGELOG_FEED_PATH)}`];
  for (const entry of changelogEntries) {
    body.push("", `## ${entry.title} (${entry.date})`, "");
    if (entry.summary) body.push(entry.summary, "");
    for (const item of entry.items) {
      const link = changelogItemLink(item);
      const target = link ? ` ${link.href.startsWith("http") ? link.href : url(link.href)}` : "";
      body.push(`- **${CHANGE_LABELS[item.type]}:** ${item.text}${target}`);
    }
  }
  return page(CHANGELOG_PATH, copy.title, copy.description, body);
}

// ---------------------------------------------------------------------------
// Site pages

/** /brand: the brand system file itself, under the usual frontmatter. */
export function brandMarkdown(source: string) {
  const copy = messages.Pages.brand.meta;
  // Drop the file's own title and its note about where the page lives.
  const body = source
    .replace(/^# .*\n+/, "")
    .replace(/^A live version of this file.*\n+/m, "")
    .trim();
  return page("/brand", copy.title, copy.description, [body]);
}

/** /themes: what the theme picker does and where its CSS goes. */
export function themesMarkdown() {
  const copy = messages.Pages.themes;
  const body = [
    copy.intro,
    "",
    `- Colors: ${Object.values(copy.colors).join(", ")}`,
    `- Base grays: ${Object.values(copy.bases).join(", ")}`,
    `- Modes: ${Object.values(copy.modes).join(", ")}`,
    "",
    copy.cssHint,
    "",
    `The tokens every component uses, and how to install them: ${url("/docs/theme.md")}`,
  ];
  return page("/themes", copy.meta.title, copy.meta.description, body);
}

/** /playground: each motion type it teaches. */
export function playgroundMarkdown() {
  const copy = messages.Pages.playground;
  const types = ["spring", "tween", "stagger", "keyframes", "gestures", "layout", "scroll"] as const;
  const body = [
    copy.header.body,
    "",
    ...types.map((key) => `- **${copy[key].label}:** ${copy[key].blurb}`),
    "",
    `Motion tokens and recipes as text: ${url("/docs/motion-patterns.md")}`,
  ];
  return page("/playground", copy.meta.title, copy.meta.description, body);
}

/** /sponsors: plans, prices, current sponsors and how to pay. */
export function sponsorsMarkdown() {
  const copy = messages.Pages.sponsors;
  const tiers: SponsorTier[] = ["diamond", "platinum", "silver"];
  const body = [copy.hero.body];
  for (const tier of tiers) {
    const plan = copy.plans[tier];
    const { price, slots } = SPONSOR_PLANS[tier];
    body.push("", `## ${plan.name}: ${price}${copy.planCard.perMonth}`, "", `${plan.description} ${slots} slots.`, "");
    body.push(...Object.values(plan.benefits).map((benefit) => `- ${benefit}`));
  }
  body.push("", "## Current sponsors", "");
  body.push(...DIAMOND_SPONSORS.map((sponsor) => `- ${sponsor.name} (${copy.plans.diamond.name}): ${copy.sponsorTaglines[sponsor.tagline]}, https://${sponsor.domain}`));
  body.push("", "## How to sponsor", "", `- Card checkout per plan: ${url("/sponsors")}`, `- GitHub Sponsors: ${GITHUB_SPONSORS_URL}`);
  if (SPONSOR_EVM_ADDRESS) body.push(`- ${copy.crypto} (EVM): \`${SPONSOR_EVM_ADDRESS}\``);
  if (SPONSOR_SOL_ADDRESS) body.push(`- ${copy.crypto} (Solana): \`${SPONSOR_SOL_ADDRESS}\``);
  return page("/sponsors", copy.meta.title, copy.meta.description, body);
}

/** /privacy, /terms and /refunds, word for word. */
export function legalMarkdown(key: "privacy" | "terms" | "refunds") {
  const copy = messages.Pages[key];
  const body = [copy.updated, "", copy.intro];
  for (const section of copy.sections as { heading: string; paragraphs?: string[]; list?: string[] }[]) {
    body.push("", `## ${section.heading}`);
    for (const paragraph of section.paragraphs ?? []) body.push("", paragraph);
    if (section.list?.length) body.push("", ...section.list.map((item) => `- ${item}`));
  }
  return page(`/${key}`, copy.meta.title, copy.meta.description, body);
}
