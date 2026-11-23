import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Blog posts: one Markdown file per post in content/blog/<slug>.md, with a
 * small frontmatter block. Read with node:fs, so import this only from server
 * functions and build scripts, never from client components.
 *
 * Posts marked `draft: true` show only in `vite dev`, so a draft can be
 * reviewed locally before it ships. The same Markdown is cross-posted to
 * dev.to and Medium with beui.dev as the canonical URL.
 */

export const BLOG_PATH = "/blog";
export const BLOG_FEED_PATH = "/blog/rss.xml";

export type BlogProduct = "beui" | "pro" | "native";

const PRODUCTS: BlogProduct[] = ["beui", "pro", "native"];

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  /** At most four; dev.to rejects more. */
  tags: string[];
  product: BlogProduct;
  draft: boolean;
  /** Cross-post URLs, filled in after publishing there. */
  devto?: string;
  medium?: string;
};

export type BlogPost = BlogPostMeta & { body: string };

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const SHOW_DRAFTS = Boolean(import.meta.env?.DEV);

export function blogPostPath(slug: string) {
  return `${BLOG_PATH}/${slug}`;
}

function parseFrontmatter(source: string, file: string) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) throw new Error(`${file}: missing frontmatter`);
  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const index = line.indexOf(":");
    if (index === -1 || !line.trim()) continue;
    const key = line.slice(0, index).trim();
    const value = line
      .slice(index + 1)
      .trim()
      .replace(/^"(.*)"$/, "$1");
    fields[key] = value;
  }
  return { fields, body: source.slice(match[0].length).trim() };
}

function readPost(file: string): BlogPost {
  return parseBlogPost(
    readFileSync(path.join(BLOG_DIR, file), "utf8"),
    file.replace(/\.md$/, ""),
    `content/blog/${file}`,
  );
}

/** Parses one post's Markdown (frontmatter + body). `label` names it in errors. */
export function parseBlogPost(source: string, slug: string, label = slug): BlogPost {
  const { fields, body } = parseFrontmatter(source, label);
  for (const key of ["title", "description", "publishedAt"]) {
    if (!fields[key]) throw new Error(`${label}: missing "${key}"`);
  }
  const tags = (fields.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags.length > 4) throw new Error(`${label}: at most 4 tags`);
  if (tags.some((tag) => !/^[a-z0-9]+$/.test(tag))) {
    throw new Error(`${label}: tags are lowercase letters and digits only (dev.to)`);
  }
  return {
    slug,
    title: fields.title,
    description: fields.description,
    publishedAt: fields.publishedAt,
    updatedAt: fields.updatedAt || fields.publishedAt,
    tags,
    product: PRODUCTS.find((product) => product === fields.product) ?? "beui",
    draft: fields.draft === "true",
    devto: fields.devto || undefined,
    medium: fields.medium || undefined,
    body,
  };
}

/** Every visible post, newest first. `drafts` includes drafts outside dev too. */
export function blogPosts({ drafts = SHOW_DRAFTS }: { drafts?: boolean } = {}): BlogPost[] {
  let files: string[];
  try {
    files = readdirSync(BLOG_DIR).filter((file) => file.endsWith(".md"));
  } catch {
    return [];
  }
  return files
    .map(readPost)
    .filter((post) => drafts || !post.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function findBlogPost(slug: string) {
  return blogPosts().find((post) => post.slug === slug);
}

/** A post as Markdown, served at /blog/<slug>.md and included in llms-full.txt. */
export function blogPostMarkdown(post: BlogPost, siteUrl: string) {
  return [
    `# ${post.title}`,
    "",
    `URL: ${siteUrl}${blogPostPath(post.slug)}`,
    `Published: ${post.publishedAt}`,
    "",
    post.body,
    "",
  ].join("\n");
}

export function blogPostMeta({ body: _body, ...meta }: BlogPost): BlogPostMeta {
  return meta;
}
