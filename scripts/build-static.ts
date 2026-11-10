// Runs after `vite build`. Writes everything the site serves that isn't a
// page into dist/client: registry JSON and Markdown, feeds, sitemap,
// robots.txt, social cards, `_redirects` and `_headers`. Cloudflare serves the
// folder as static assets; worker/index.ts serves the /r and /native/r
// endpoints from dist/client/__worker/routes.json so their headers stay exact.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { CHANGE_LABELS, CHANGELOG_PATH, changelogAnchor, changelogEntries, changelogItemLink } from "../lib/changelog";
import { buildComponentMarkdown } from "../lib/component-markdown";
import { componentPath } from "../lib/component-paths";
import { buildGuideMarkdown, GUIDE_SLUGS } from "../lib/guide-markdown";
import { native } from "../lib/native";
import { buildNativeEntry, buildNativeIndex, NATIVE_HEADERS } from "../lib/native-registry";
import { OG_SIZE } from "../lib/og";
import { ogCardElement, ogCards } from "../lib/og-cards";
import { redirectsFile } from "../lib/redirects";
import { allComponents } from "../lib/registry";
import {
  allRegistryTargets,
  allShadcnTargets,
  buildEntry,
  buildIndex,
  buildShadcnItem,
  buildShadcnRegistry,
} from "../lib/registry-server";
import { robotsTxt } from "../lib/robots";
import { SITE_URL } from "../lib/site";
import { sitemapXml } from "../lib/sitemap";
import { readSourceFile } from "../lib/source-files";
import { THEME_CSS } from "../lib/theme-css";

const OUT = "dist/client";
/** Bodies the Worker serves live here, out of the way of public URLs. */
const WORKER_DIR = "__worker";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
};
const CACHE = { "cache-control": "public, max-age=300, s-maxage=3600" };
const JSON_TYPE = { "content-type": "application/json" };

async function write(file: string, body: string | Uint8Array) {
  const target = path.join(OUT, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, body);
}

const json = (data: unknown) => JSON.stringify(data);

// Several outputs share these, and each one reads and bundles source files.
function once<T>(build: () => Promise<T>) {
  let result: Promise<T> | undefined;
  return () => {
    result ??= build();
    return result;
  };
}
const registryIndex = once(buildIndex);
const shadcnRegistry = once(buildShadcnRegistry);
const markdownCache = new Map<string, ReturnType<typeof buildComponentMarkdown>>();
function componentMarkdown(categorySlug: string, slug: string) {
  const key = `${categorySlug}/${slug}`;
  let markdown = markdownCache.get(key);
  if (!markdown) {
    markdown = buildComponentMarkdown(categorySlug, slug);
    markdownCache.set(key, markdown);
  }
  return markdown;
}

// ---------------------------------------------------------------------------
// /r and /native/r: served by the Worker with the exact headers the old route
// handlers sent.

type WorkerRoute = { asset: string; headers: Record<string, string> };
const workerRoutes: Record<string, WorkerRoute> = {};

async function workerRoute(urlPath: string, body: string, headers: Record<string, string>) {
  const asset = `/${WORKER_DIR}${urlPath === "/" ? "/index" : urlPath}.body`;
  await write(asset, body);
  workerRoutes[urlPath] = { asset, headers };
}

async function buildRegistry() {
  await workerRoute("/r", json(await registryIndex()), {
    ...JSON_TYPE,
    ...CACHE,
    ...CORS,
    link: '</llms.txt>; rel="describedby"; type="text/plain"',
  });
  await workerRoute("/r/registry.json", json(await shadcnRegistry()), {
    ...JSON_TYPE,
    ...CACHE,
    ...CORS,
    link: '</r>; rel="alternate"; type="application/json", </llms.txt>; rel="describedby"; type="text/plain"',
  });

  for (const target of allRegistryTargets()) {
    const { slug, categorySlug, pageSlug } = target;
    const entry = await buildEntry(categorySlug, slug);
    if (entry) {
      await workerRoute(`/r/${slug}`, json(entry), {
        ...JSON_TYPE,
        ...CACHE,
        ...CORS,
        link: `</r/${slug}/raw>; rel="alternate"; type="text/plain", <${componentPath(categorySlug, slug)}.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain"`,
      });
    }
    await workerRoute(`/r/${slug}/raw`, await readSourceFile(target.file), {
      "content-type": "text/plain; charset=utf-8",
      ...CACHE,
      ...CORS,
      "x-robots-tag": "noindex",
      link: `</r/${slug}>; rel="alternate"; type="application/json"`,
    });
    const markdown = await componentMarkdown(categorySlug, pageSlug);
    if (markdown) {
      await workerRoute(`/r/${slug}.md`, markdown, {
        "content-type": "text/markdown; charset=utf-8",
        ...CACHE,
        ...CORS,
        "x-robots-tag": "noindex",
        link: `<${componentPath(categorySlug, pageSlug)}>; rel="canonical"; type="text/html"`,
      });
    }
  }

  for (const target of allShadcnTargets()) {
    const item = await buildShadcnItem(target.categorySlug, target.slug);
    if (!item) continue;
    await workerRoute(`/r/${target.slug}.json`, json(item), {
      ...JSON_TYPE,
      ...CACHE,
      ...CORS,
      link: '</r/registry.json>; rel="collection"; type="application/json"',
    });
    // shadcn directory items at /{slug}.json: same item without file contents.
    const directoryItem = await buildShadcnItem(target.categorySlug, target.slug, {
      includeContent: false,
    });
    if (directoryItem) await write(`/${target.slug}.json`, json(directoryItem));
  }

  await workerRoute("/native/r", json(buildNativeIndex()), {
    ...JSON_TYPE,
    ...NATIVE_HEADERS,
    link: '</llms.txt>; rel="describedby"; type="text/plain"',
  });
  for (const component of native.components) {
    const entry = buildNativeEntry(component.slug);
    if (entry) await workerRoute(`/native/r/${component.slug}`, json(entry), { ...JSON_TYPE, ...NATIVE_HEADERS });
  }

  await write(`/${WORKER_DIR}/routes.json`, json(workerRoutes));
}

// ---------------------------------------------------------------------------
// Plain static files.

async function buildMarkdownPages() {
  // Component Markdown at the page URL plus ".md".
  for (const component of allComponents()) {
    const markdown = await componentMarkdown(component.category.slug, component.slug);
    if (!markdown) continue;
    await write(`${componentPath(component.category.slug, component.slug)}.md`, markdown);
  }
  for (const slug of GUIDE_SLUGS) {
    const markdown = buildGuideMarkdown(slug);
    if (markdown) await write(`/docs/${slug}.md`, markdown);
  }
}

async function buildLlmsTxt() {
  const idx = await registryIndex();
  const nativeIndex = buildNativeIndex();
  const lines = [
    `# ${idx.name}`,
    "",
    `> ${idx.description}`,
    "",
    "## Endpoints",
    "",
    `- Registry index (JSON): ${idx.endpoints.index}`,
    `- Component detail (JSON): ${idx.endpoints.detail}`,
    `- Raw source (text/plain): ${idx.endpoints.raw}`,
    `- Component Markdown: ${idx.endpoints.markdown}`,
    "",
    "## Guides",
    "",
    `- [Motion Guides](${SITE_URL}/docs/motion-patterns.md): Purposeful motion, timing, easing, recipes, and reduced motion.`,
    `- [Agent Guide](${SITE_URL}/docs/ai-agents.md): Agent skill, MCP server, registry endpoints, and install flows.`,
    `- [OpenUI Guide](${SITE_URL}/docs/openui.md): Register beUI components and render streamed generative interfaces.`,
    `- [Changelog](${SITE_URL}/changelog/rss.xml): New components, improvements and fixes by release date, as an RSS feed.`,
    `- [React Native Setup](${SITE_URL}/docs/native-setup.md): One-time app setup for beUI Native: libraries, Uniwind, theme tokens and folder layout.`,
    "",
    "## Components",
    "",
    ...idx.components.map((c) => `- [${c.name}](${c.markdown_url}): ${c.description}`),
    "",
    "## React Native (beUI Native)",
    "",
    `> ${nativeIndex.description}`,
    "",
    `- All native components: ${SITE_URL}/react-native`,
    `- Native index (JSON): ${nativeIndex.endpoints.index}`,
    `- Native detail (JSON, every file with contents): ${nativeIndex.endpoints.detail}`,
    `- Source: ${nativeIndex.repository}`,
    "",
    ...nativeIndex.components.map(
      (c) => `- [${c.name}](${c.page_url}): ${c.description} JSON: ${c.detail_url}`,
    ),
    "",
    "To add a native component, run `npx beui-native add <slug>` from the app's root. To do it by hand: fetch its detail JSON, run its `install` commands, then copy every file in `files` to its `path`, keeping the folder layout. Add the `theme` file once per app.",
    "",
    "## Usage for agents",
    "",
    "1. Fetch the index to discover components.",
    "2. Fetch a component detail JSON for files, deps and source.",
    "3. Drop files into the user's project at the listed paths.",
    "4. Install external `dependencies` listed on the entry.",
    "5. Internal helpers (e.g. `@/lib/utils`) ship in the `files` array as `type: util`.",
    "",
  ];
  await write("/llms.txt", lines.join("\n"));
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** RSS 2.0 feed of the changelog, one item per release. */
async function buildRss() {
  const items = changelogEntries
    .map((entry) => {
      const url = `${SITE_URL}${CHANGELOG_PATH}#${changelogAnchor(entry.date)}`;
      const list = entry.items
        .map((item) => {
          const link = changelogItemLink(item);
          const text = escapeXml(item.text);
          const body = link
            ? `${text} <a href="${SITE_URL}${link.href}">${escapeXml(link.label ?? "Learn more")}</a>`
            : text;
          return `<li><strong>${CHANGE_LABELS[item.type]}:</strong> ${body}</li>`;
        })
        .join("");
      const html = `${entry.summary ? `<p>${escapeXml(entry.summary)}</p>` : ""}<ul>${list}</ul>`;
      return [
        "<item>",
        `<title>${escapeXml(entry.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(`${entry.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        `<description><![CDATA[${html}]]></description>`,
        "</item>",
      ].join("");
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>beUI Changelog</title><link>${SITE_URL}${CHANGELOG_PATH}</link><description>New components, improvements and fixes in beUI.</description><language>en</language><atom:link href="${SITE_URL}${CHANGELOG_PATH}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  await write(`${CHANGELOG_PATH}/rss.xml`, xml);
}

async function buildOgCards() {
  const font = (file: string) => readFile(path.join("public/og/fonts", file));
  const dataUri = async (file: string) =>
    `data:image/png;base64,${(await readFile(path.join("public", file))).toString("base64")}`;
  const [regular, medium, backgroundSrc, logoSrc] = await Promise.all([
    font("Manrope-Regular.ttf"),
    font("Manrope-Medium.ttf"),
    dataUri("og/component-gallery.png"),
    dataUri("beui-mark.png"),
  ]);
  const fonts = [
    { name: "Manrope", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Manrope", data: medium, weight: 500 as const, style: "normal" as const },
  ];
  const cards = ogCards();
  // A few at a time: each render holds the 1200x630 bitmap in memory.
  for (let index = 0; index < cards.length; index += 8) {
    await Promise.all(
      cards.slice(index, index + 8).map(async (card) => {
        const svg = await satori(ogCardElement(card, { backgroundSrc, logoSrc }), { ...OG_SIZE, fonts });
        await write(card.path, new Resvg(svg).render().asPng());
      }),
    );
  }
  return cards.length;
}

/** Response headers for the static files (Cloudflare `_headers`). */
const HEADERS = `/assets/*
  Cache-Control: public, max-age=31536000, immutable

/manifest.webmanifest
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=3600

/og/cards/*
  Cache-Control: public, max-age=3600

/*.md
  Content-Type: text/markdown; charset=utf-8
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  X-Robots-Tag: noindex
  Cache-Control: public, max-age=300, s-maxage=3600

/*.json
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Cache-Control: public, max-age=300, s-maxage=3600

/llms.txt
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Cache-Control: public, max-age=300, s-maxage=3600

/theme.css
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Cache-Control: public, max-age=300, s-maxage=3600

/changelog/rss.xml
  Content-Type: application/rss+xml; charset=utf-8
  Cache-Control: public, max-age=300, s-maxage=3600

/__worker/*
  X-Robots-Tag: noindex
`;

const started = Date.now();
await rm(path.join(OUT, WORKER_DIR), { recursive: true, force: true });
await buildRegistry();
await buildMarkdownPages();
await Promise.all([
  buildLlmsTxt(),
  buildRss(),
  write("/registry.json", json(await shadcnRegistry())),
  write("/theme.css", THEME_CSS),
  write("/sitemap.xml", sitemapXml()),
  write("/robots.txt", robotsTxt()),
  write("/_redirects", redirectsFile()),
  write("/_headers", HEADERS),
]);
const cardCount = await buildOgCards();
console.log(
  `Static build: ${Object.keys(workerRoutes).length} registry responses, ${cardCount} social cards, in ${((Date.now() - started) / 1000).toFixed(1)}s.`,
);
