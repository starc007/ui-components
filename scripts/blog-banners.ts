// Renders blog banners (drafts included) into public/og/cards/blog/ so
// `vite dev` shows them while a post is in review. The folder is gitignored:
// production banners come from scripts/build-static.ts.
//
//   bun run blog:banners            every post
//   bun run blog:banners <slug>     one post
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { blogPosts } from "../lib/blog";
import { loadBannerAssets, renderBlogBanners } from "../lib/blog-banner";
import { blogCoverPath, ogImagePath } from "../lib/og-paths";

const only = process.argv[2];
const posts = blogPosts({ drafts: true }).filter((post) => !only || post.slug === only);
if (only && !posts.length) throw new Error(`No post "${only}" in content/blog/`);

const assets = await loadBannerAssets();
const save = async (file: string, png: Uint8Array) => {
  const target = path.join("public", file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, png);
  return target;
};
for (const post of posts) {
  const { og, cover } = await renderBlogBanners(post, assets);
  console.log(await save(ogImagePath("blog", post.slug), og));
  console.log(await save(blogCoverPath(post.slug), cover));
}
