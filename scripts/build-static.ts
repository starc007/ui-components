// Runs after `vite build`. Writes everything the site serves that isn't a
// page into dist/client: registry JSON and Markdown, feeds, sitemap,
// robots.txt, social cards, `_redirects` and `_headers`. Cloudflare serves the
// folder as static assets; worker/index.ts serves the /r and /native/r
// endpoints from dist/client/__worker/routes.json so their headers stay exact.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { loadBannerAssets, RESVG_OPTIONS, renderBlogBanners } from "../lib/blog-banner";
import { blogCoverPath, ogImagePath } from "../lib/og-paths";
import { BLOG_FEED_PATH, BLOG_PATH, blogPostMarkdown, blogPostPath, blogPosts } from "../lib/blog";
import { CHANGE_LABELS, CHANGELOG_PATH, changelogAnchor, changelogEntries, changelogItemLink } from "../lib/changelog";
import { buildComponentMarkdown, buildVariantMarkdown } from "../lib/component-markdown";
import { variantCopy } from "../lib/variant-copy";
import { allVariantPages, docsPathFor, variantPath } from "../lib/variant-pages";
import { componentPath } from "../lib/component-paths";
import { buildGuideMarkdown, GUIDE_SLUGS } from "../lib/guide-markdown";
import { native } from "../lib/native";
import { buildNativeEntry, buildNativeIndex, NATIVE_HEADERS } from "../lib/native-registry";
import { OG_SIZE } from "../lib/og";
import { loadCardFonts } from "../lib/og-fonts";
import { ogCardElement, ogCards } from "../lib/og-cards";
import { GITHUB_STARS_PATH, getGithubStarCount } from "../lib/github";
import { redirectsFile } from "../lib/redirects";
import { allComponents, registry } from "../lib/registry";
import {
  allRegistryTargets,
  allShadcnTargets,
  buildEntry,
  buildIndex,
  buildShadcnItem,
  buildShadcnRegistry,
} from "../lib/registry-server";
import { robotsTxt } from "../lib/robots";
import { SITE_TAGLINE } from "../lib/seo";
import { seoPagePath, seoPages } from "../lib/seo-pages";
import { seoPageMarkdown } from "../lib/seo-pages/markdown";
import { SITE_URL } from "../lib/site";
import { escapeXml, sitemapXml } from "../lib/sitemap";
import { readSourceFile } from "../lib/source-files";
import { THEME_CSS } from "../lib/theme-css";
import { buildThemeItem, THEME_SLUG } from "../lib/theme-registry";

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
const variantPages = new Map(
  allVariantPages().map((ref) => [variantPath(ref.category, ref.comp.slug, ref.example.slug), ref]),
);
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
    // A variant of a split page has its own docs page.
    const docsPath = docsPathFor(categorySlug, pageSlug, slug);
    if (entry) {
      await workerRoute(`/r/${slug}`, json(entry), {
        ...JSON_TYPE,
        ...CACHE,
        ...CORS,
        link: `</r/${slug}/raw>; rel="alternate"; type="text/plain", <${docsPath}.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain"`,
      });
    }
    await workerRoute(`/r/${slug}/raw`, await readSourceFile(target.file), {
      "content-type": "text/plain; charset=utf-8",
      ...CACHE,
      ...CORS,
      "x-robots-tag": "noindex",
      link: `</r/${slug}>; rel="alternate"; type="application/json"`,
    });
    const variant = variantPages.get(docsPath);
    const markdown = variant
      ? await buildVariantMarkdown(categorySlug, pageSlug, variant.example.slug)
      : await componentMarkdown(categorySlug, pageSlug);
    if (markdown) {
      await workerRoute(`/r/${slug}.md`, markdown, {
        "content-type": "text/markdown; charset=utf-8",
        ...CACHE,
        ...CORS,
        "x-robots-tag": "noindex",
        link: `<${docsPath}>; rel="canonical"; type="text/html"`,
      });
    }
  }

  // beUI's extra theme tokens, a registry dependency of components using them.
  const themeItem = json(buildThemeItem());
  await workerRoute(`/r/${THEME_SLUG}.json`, themeItem, {
    ...JSON_TYPE,
    ...CACHE,
    ...CORS,
    link: '</r/registry.json>; rel="collection"; type="application/json"',
  });
  await write(`/${THEME_SLUG}.json`, themeItem);

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
  for (const [pagePath, { category, comp, example }] of variantPages) {
    const markdown = await buildVariantMarkdown(category, comp.slug, example.slug);
    if (markdown) await write(`${pagePath}.md`, markdown);
  }
  for (const slug of GUIDE_SLUGS) {
    const markdown = buildGuideMarkdown(slug);
    if (markdown) await write(`/docs/${slug}.md`, markdown);
  }
  for (const kind of ["guides", "alternatives"] as const) {
    for (const page of seoPages(kind)) {
      await write(`${seoPagePath(kind, page.slug)}.md`, seoPageMarkdown(kind, page));
    }
  }
  for (const post of blogPosts()) {
    await write(`${blogPostPath(post.slug)}.md`, blogPostMarkdown(post, SITE_URL));
  }
}

/** Docs guides, how-to guides, comparisons and posts, as Markdown sections. */
function guideSections() {
  const sections: string[] = [];
  for (const slug of GUIDE_SLUGS) {
    const markdown = buildGuideMarkdown(slug);
    if (markdown) sections.push(markdown.trim(), "", "---", "");
  }
  for (const kind of ["guides", "alternatives"] as const) {
    for (const page of seoPages(kind)) {
      sections.push(seoPageMarkdown(kind, page).trim(), "", "---", "");
    }
  }
  for (const post of blogPosts()) {
    sections.push(blogPostMarkdown(post, SITE_URL).trim(), "", "---", "");
  }
  return sections;
}

/** One category's component docs, every page's Markdown in sidebar order. */
async function categorySections(categorySlug: string) {
  const sections: string[] = [];
  for (const component of allComponents()) {
    if (component.category.slug !== categorySlug) continue;
    const markdown = await componentMarkdown(component.category.slug, component.slug);
    if (markdown) sections.push(markdown.trim(), "", "---", "");
  }
  return sections;
}

/** The per-category doc files under /llms/, next to llms-full.txt. */
const LLMS_PARTS = [
  ...registry.map((category) => ({
    path: `/llms/${category.slug}.txt`,
    title: category.name,
    category: category.slug,
  })),
  { path: "/llms/guides.txt", title: "Guides, comparisons and blog", category: null },
];

/**
 * Every guide and component page's Markdown in one file, so an agent can load
 * the docs in one fetch, plus the same docs split by category under /llms/,
 * small enough for one context: an agent building chat UI loads
 * /llms/agents.txt rather than all of it.
 */
async function buildLlmsFullTxt() {
  const idx = await registryIndex();
  // The site tagline, not the web registry's description: these files cover
  // beUI Native too.
  const header = (title: string) => [
    `# ${idx.name}${title ? `: ${title}` : ""}`,
    "",
    `> ${SITE_TAGLINE}.`,
    "",
    `Index: ${SITE_URL}/llms.txt`,
    "",
  ];
  const guides = guideSections();
  const byCategory = new Map<string, string[]>();
  for (const category of registry) byCategory.set(category.slug, await categorySections(category.slug));

  await write(
    "/llms-full.txt",
    [...header(""), ...guides, ...registry.flatMap((c) => byCategory.get(c.slug) ?? [])].join("\n"),
  );
  for (const part of LLMS_PARTS) {
    const body = part.category ? (byCategory.get(part.category) ?? []) : guides;
    await write(part.path, [...header(part.title), ...body].join("\n"));
  }
}

async function buildLlmsTxt() {
  const idx = await registryIndex();
  const nativeIndex = buildNativeIndex();
  const installList = (slugs: string[]) => slugs.map((slug) => `\`${slug}\``).join(", ");
  const lines = [
    `# ${idx.name}`,
    "",
    `> ${SITE_TAGLINE}.`,
    "",
    "beUI is copy-paste source, not a package: each component installs into the project with the shadcn CLI as `@beui/<install-slug>`, with its npm dependencies and, when it uses them, beUI's extra theme tokens. Components are React with Tailwind CSS v4 and Framer Motion (`motion`), respect reduced motion, and take a `className` and `labels` for translation.",
    "",
    "## Start here",
    "",
    `1. Set up once: a shadcn project needs nothing more (run \`npx shadcn@latest init\` if it has no components.json). Without shadcn, paste ${idx.endpoints.theme_css} into globals.css.`,
    `2. Find a component: the Components list below, the index at ${idx.endpoints.index} (every page with its \`install_slugs\` and \`variants\`), or the MCP server's \`search_components\`.`,
    `3. Read its docs before writing code: ${idx.endpoints.markdown_by_slug} has usage, every prop with its type and default, the data types its props take, composition and accessibility.`,
    "4. Install: `npx shadcn@latest add @beui/<install-slug>`. A page that splits into variants (Button) installs only by its variants' slugs.",
    "5. Compose with the named exports in the added files. There is no runtime `beui` package.",
    "",
    "## Endpoints",
    "",
    `- Registry index (JSON, install slugs and variants per page): ${idx.endpoints.index}`,
    `- Component docs (Markdown) by slug: ${idx.endpoints.markdown_by_slug}`,
    `- Component detail (JSON: files, dependencies, props, types): ${idx.endpoints.detail}`,
    `- Raw source (text/plain): ${idx.endpoints.raw}`,
    `- shadcn registry: ${idx.endpoints.shadcn_registry}`,
    `- Theme tokens as a shadcn item: ${idx.endpoints.theme_item}`,
    `- Theme CSS to paste: ${idx.endpoints.theme_css}`,
    "- MCP server (HTTP, no key): https://mcp.beui.dev/mcp",
    "- Agent skill: `npx skills add starc007/ui-components --skill beui`",
    `- Docs for one category, one file each: ${LLMS_PARTS.map((part) => `${SITE_URL}${part.path}`).join(", ")}`,
    `- Every doc in one file (large): ${SITE_URL}/llms-full.txt`,
    "",
    "## Components",
    "",
    ...registry.flatMap((category) => {
      const pages = idx.components.filter((c) => c.category === category.slug);
      if (!pages.length) return [];
      return [
        `### ${category.name}`,
        "",
        `All ${category.name} docs in one file: ${SITE_URL}/llms/${category.slug}.txt`,
        "",
        ...pages.flatMap((c) => [
          `- [${c.name}](${c.markdown_url}): ${c.description} Install: ${installList(c.install_slugs)}`,
          // A split page lists its variant pages under it.
          ...[...variantPages]
            .filter(([, v]) => v.category === c.category && v.comp.slug === c.slug)
            .map(([pagePath, v]) => {
              const copy = variantCopy[v.example.installSlug];
              return `  - [${copy?.name ?? v.example.name}](${SITE_URL}${pagePath}.md): ${copy?.summary ?? v.example.description ?? ""} Install: \`${v.example.installSlug}\``;
            }),
        ]),
        "",
      ];
    }),
    "## Guides",
    "",
    `- [Theme Setup](${SITE_URL}/docs/theme.md): The tokens components use, with shadcn or as pasted CSS.`,
    `- [Motion Guides](${SITE_URL}/docs/motion-patterns.md): Purposeful motion, timing, easing, recipes, and reduced motion.`,
    `- [Agent Guide](${SITE_URL}/docs/ai-agents.md): Agent skill, MCP server, registry endpoints, and install flows.`,
    `- [OpenUI Guide](${SITE_URL}/docs/openui.md): Register beUI components and render streamed generative interfaces.`,
    `- [Changelog](${SITE_URL}/changelog/rss.xml): New components, improvements and fixes by release date, as an RSS feed.`,
    `- [React Native Setup](${SITE_URL}/docs/native-setup.md): One-time app setup for beUI Native: libraries, Uniwind, theme tokens and folder layout.`,
    "",
    "## Comparisons and guides",
    "",
    `- [All guides](${SITE_URL}/guides)`,
    `- [All comparisons](${SITE_URL}/alternatives)`,
    ...(["guides", "alternatives"] as const).flatMap((kind) =>
      seoPages(kind).map(
        (page) =>
          `- [${page.title}](${SITE_URL}${seoPagePath(kind, page.slug)}.md): ${page.description}`,
      ),
    ),
    "",
    "## Blog",
    "",
    `- [All posts](${SITE_URL}${BLOG_PATH}) (RSS: ${SITE_URL}${BLOG_FEED_PATH})`,
    ...blogPosts().map(
      (post) => `- [${post.title}](${SITE_URL}${blogPostPath(post.slug)}.md): ${post.description}`,
    ),
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
    "## Copying by hand",
    "",
    "Without the shadcn CLI: fetch a component's detail JSON, copy every file in `files` to its `path` (component files and their internal helpers such as `@/lib/utils`, typed `util`), install its `dependencies`, and add the theme tokens once.",
    "",
  ];
  await write("/llms.txt", lines.join("\n"));
}

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

/** RSS 2.0 feed of the blog, one item per post with its description. */
async function buildBlogRss() {
  const items = blogPosts()
    .map((post) => {
      const url = `${SITE_URL}${blogPostPath(post.slug)}`;
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(`${post.publishedAt}T00:00:00Z`).toUTCString()}</pubDate>`,
        `<description>${escapeXml(post.description)}</description>`,
        ...post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`),
        "</item>",
      ].join("");
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>beUI Blog</title><link>${SITE_URL}${BLOG_PATH}</link><description>Notes on building animated React interfaces with beUI.</description><language>en</language><atom:link href="${SITE_URL}${BLOG_FEED_PATH}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  await write(BLOG_FEED_PATH, xml);
}

/** Each blog post's social card and cover, from lib/blog-banner.tsx. */
async function buildBlogBanners() {
  const assets = await loadBannerAssets();
  const posts = blogPosts();
  for (const post of posts) {
    const { og, cover } = await renderBlogBanners(post, assets);
    await write(ogImagePath("blog", post.slug), og);
    await write(blogCoverPath(post.slug), cover);
  }
  return posts.length * 2;
}

async function buildOgCards() {
  const dataUri = async (file: string) =>
    `data:image/png;base64,${(await readFile(path.join("public", file))).toString("base64")}`;
  const [fonts, backgroundSrc, logoSrc] = await Promise.all([
    loadCardFonts(),
    dataUri("og/component-gallery.png"),
    dataUri("beui-mark.png"),
  ]);
  const cards = ogCards();
  // A few at a time: each render holds the 1200x630 bitmap in memory.
  for (let index = 0; index < cards.length; index += 8) {
    await Promise.all(
      cards.slice(index, index + 8).map(async (card) => {
        const svg = await satori(ogCardElement(card, { backgroundSrc, logoSrc }), { ...OG_SIZE, fonts });
        await write(card.path, new Resvg(svg, RESVG_OPTIONS).render().asPng());
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

/llms-full.txt
  Content-Type: text/plain; charset=utf-8
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Cache-Control: public, max-age=300, s-maxage=3600

/llms/*
  Content-Type: text/plain; charset=utf-8
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

/blog/rss.xml
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
  buildLlmsFullTxt(),
  buildRss(),
  buildBlogRss(),
  write("/registry.json", json(await shadcnRegistry())),
  write("/theme.css", THEME_CSS),
  write("/sitemap.xml", sitemapXml()),
  write("/robots.txt", robotsTxt()),
  write("/_redirects", redirectsFile()),
  write("/_headers", HEADERS),
  // Read by the site header. Fetched once per build, so page views never run
  // the Worker or spend GitHub's unauthenticated rate limit; null when GitHub
  // is unreachable, and the header then shows the link without a count.
  getGithubStarCount().then((count) => write(GITHUB_STARS_PATH, json({ count }))),
]);
const cardCount = (await buildOgCards()) + (await buildBlogBanners());
console.log(
  `Static build: ${Object.keys(workerRoutes).length} registry responses, ${cardCount} social cards, in ${((Date.now() - started) / 1000).toFixed(1)}s.`,
);
