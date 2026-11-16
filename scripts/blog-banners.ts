// Renders blog-style banners into public/og/cards/blog/ (gitignored) for
// local review and for cross-post covers. Production blog banners come from
// scripts/build-static.ts.
//
//   bun run blog:banners                    every blog post (drafts included)
//   bun run blog:banners <slug>             one blog post
//   bun run blog:banners --guide <slug>     a /guides page, for its dev.to and
//                                           Medium cover (guide-<slug>-cover.png)
//   bun run blog:banners --compare <slug>   an /alternatives page (compare-<slug>-cover.png)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { blogPosts } from "../lib/blog";
import { loadBannerAssets, renderBlogBanners } from "../lib/blog-banner";
import { blogCoverPath, ogImagePath } from "../lib/og-paths";
import { findSeoPage } from "../lib/seo-pages";

const assets = await loadBannerAssets();
const save = async (file: string, png: Uint8Array) => {
  const target = path.join("public", file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, png);
  console.log(target);
};

const [flag, value] = process.argv.slice(2);

if (flag === "--guide" || flag === "--compare") {
  const kind = flag === "--guide" ? "guides" : "alternatives";
  const page = value ? findSeoPage(kind, value) : undefined;
  if (!page) throw new Error(`No ${kind} page "${value}" in lib/seo-pages/${kind}.ts`);
  const slug = `${flag === "--guide" ? "guide" : "compare"}-${page.slug}`;
  const { og, cover } = await renderBlogBanners({ slug, title: page.heading, product: "beui" }, assets);
  await save(ogImagePath("blog", slug), og);
  await save(blogCoverPath(slug), cover);
} else {
  const posts = blogPosts({ drafts: true }).filter((post) => !flag || post.slug === flag);
  if (flag && !posts.length) throw new Error(`No post "${flag}" in content/blog/`);
  for (const post of posts) {
    const { og, cover } = await renderBlogBanners(post, assets);
    await save(ogImagePath("blog", post.slug), og);
    await save(blogCoverPath(post.slug), cover);
  }
}
