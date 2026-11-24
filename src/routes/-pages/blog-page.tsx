import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { getTranslations } from "@/i18n/server";
import { BLOG_FEED_PATH, BLOG_PATH, blogPostMeta, blogPostPath, blogPosts, findBlogPost } from "@/lib/blog";
import { renderBlogMarkdown } from "@/lib/blog-markdown";
import { pageMetadata } from "@/lib/head";
import { ogImagePath } from "@/lib/og-paths";

/** The /blog list: every visible post's frontmatter, newest first. */
export const getBlogIndex = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Native.blog");
    const title = t("title");
    const description = t("description");
    const metadata = pageMetadata({
      path: BLOG_PATH,
      title,
      description,
      image: ogImagePath("page", "blog"),
      imageAlt: title,
      types: { "application/rss+xml": BLOG_FEED_PATH },
    });
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
    const metadata = pageMetadata({
      path,
      title: post.title,
      description: post.description,
      type: "article",
      image: ogImagePath("blog", post.slug),
      imageAlt: post.title,
      types: { "text/markdown": `${path}.md` },
    });
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
