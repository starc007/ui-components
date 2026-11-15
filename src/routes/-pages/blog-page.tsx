import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { getTranslations } from "@/i18n/server";
import { BLOG_FEED_PATH, BLOG_PATH, blogPostMeta, blogPostPath, blogPosts, findBlogPost } from "@/lib/blog";
import { renderBlogMarkdown } from "@/lib/blog-markdown";
import type { Metadata } from "@/lib/head";
import { ogImagePath } from "@/lib/og-paths";

/** The /blog list: every visible post's frontmatter, newest first. */
export const getBlogIndex = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Native.blog");
    const title = t("title");
    const description = t("description");
    const image = ogImagePath("page", "blog");
    const metadata: Metadata = {
      title,
      description,
      alternates: {
        canonical: BLOG_PATH,
        types: { "application/rss+xml": BLOG_FEED_PATH },
      },
      openGraph: {
        title: `${title} · beUI`,
        description,
        url: BLOG_PATH,
        type: "website",
        siteName: "beUI",
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: { card: "summary_large_image", title: `${title} · beUI`, description, images: [image] },
    };
    return { posts: blogPosts().map(blogPostMeta), metadata };
  });

/** One post: frontmatter, the body as HTML and highlighted code blocks, and metadata. */
export const getBlogPost = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const post = findBlogPost(slug);
    if (!post) return null;
    const path = blogPostPath(post.slug);
    const image = ogImagePath("blog", post.slug);
    const ogTitle = `${post.title} · beUI`;
    const metadata: Metadata = {
      title: post.title,
      description: post.description,
      alternates: { canonical: path, types: { "text/markdown": `${path}.md` } },
      openGraph: {
        title: ogTitle,
        description: post.description,
        url: path,
        type: "article",
        siteName: "beUI",
        images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: ogTitle,
        description: post.description,
        images: [image],
      },
    };
    return {
      post: blogPostMeta(post),
      blocks: await renderBlogMarkdown(post.body),
      metadata,
    };
  });

export async function loadBlogPost(slug: string) {
  const data = await getBlogPost({ data: slug });
  if (!data) throw notFound();
  return data;
}
