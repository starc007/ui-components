// Turns one post folder's website.md into the dev.to and Medium versions and
// its banners, so all three copies come from one source:
//
//   <folder>/website.md   beui.dev post (copy to content/blog/<slug>.md to publish)
//   <folder>/devto.md     dev.to front matter (canonical_url, cover_image) + body
//   <folder>/medium.md    title, subtitle and body for Medium (import from the
//                         beui.dev URL is preferred; this is the paste fallback)
//   <folder>/cover.png    2000x840 cover (post page, dev.to, Medium)
//   <folder>/og.png       1200x630 social card
//
//   bun run blog:export <folder> [<folder> ...]
//
// The slug is the folder name without a leading "NN-" order prefix.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { blogPostPath, parseBlogPost } from "../lib/blog";
import { loadBannerAssets, renderBlogBanners } from "../lib/blog-banner";
import { blogCoverPath } from "../lib/og-paths";
import { SITE_URL } from "../lib/site";

const folders = process.argv.slice(2);
if (!folders.length) throw new Error("Usage: bun run blog:export <post folder> [...]");

/** Platforms don't support ```tsx title="file.tsx"; keep the language only. */
const plainFences = (body: string) => body.replace(/^(```[\w-]*)[^\S\n]+title="[^"]*"/gm, "$1");

const assets = await loadBannerAssets();

for (const folder of folders) {
  const dir = path.resolve(folder);
  const slug = path.basename(dir).replace(/^\d+-/, "");
  const post = parseBlogPost(await readFile(path.join(dir, "website.md"), "utf8"), slug, `${folder}/website.md`);
  if (/—/.test(post.title + post.description + post.body)) {
    throw new Error(`${folder}: contains an em dash`);
  }
  const url = `${SITE_URL}${blogPostPath(slug)}`;
  const body = plainFences(post.body);
  const credit = `*Originally published on [beUI](${url}).*`;

  const devto = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    "published: false",
    `description: ${JSON.stringify(post.description)}`,
    `tags: ${post.tags.join(", ")}`,
    `canonical_url: ${url}`,
    `cover_image: ${SITE_URL}${blogCoverPath(slug)}`,
    "---",
    "",
    body,
    "",
    "---",
    "",
    credit,
    "",
  ].join("\n");

  const medium = [
    `# ${post.title}`,
    "",
    `*${post.description}*`,
    "",
    body,
    "",
    credit,
    "",
  ].join("\n");

  const { og, cover } = await renderBlogBanners({ ...post, slug }, assets);
  await Promise.all([
    writeFile(path.join(dir, "devto.md"), devto),
    writeFile(path.join(dir, "medium.md"), medium),
    writeFile(path.join(dir, "cover.png"), cover),
    writeFile(path.join(dir, "og.png"), og),
  ]);
  console.log(`${folder}: website.md -> devto.md, medium.md, cover.png, og.png (${url})`);
}
