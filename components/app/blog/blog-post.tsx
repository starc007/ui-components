import { ArrowLeft } from "lucide-react";
import { useFormatter, useTranslations } from "use-intl";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { CodeBlock } from "@/components/app/docs/code-block";
import { SeoPageCta } from "@/components/app/docs/seo-page-cta";
import type { BlogPostMeta } from "@/lib/blog";
import type { BlogBlock } from "@/lib/blog-markdown";
import { Link } from "@/lib/navigation";
import { blogCoverPath, ogImagePath } from "@/lib/og-paths";
import { breadcrumbJsonLd, docsArticleJsonLd } from "@/lib/seo";

/** One blog post. `blocks` is the body from the page's server function. */
export function BlogPost({ post, blocks }: { post: BlogPostMeta; blocks: BlogBlock[] }) {
  const t = useTranslations("Native.blog");
  const format = useFormatter();
  const path = `/blog/${post.slug}`;

  return (
    <article className="mx-auto min-w-0 max-w-3xl px-4 py-16">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "beUI", path: "/" },
            { name: t("title"), path: "/blog" },
            { name: post.title, path },
          ]),
          docsArticleJsonLd({
            path,
            headline: post.title,
            description: post.description,
            image: ogImagePath("blog", post.slug),
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
          }),
        ]}
      />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        {t("back")}
      </Link>
      <header className="mt-8">
        <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <time dateTime={post.publishedAt}>
            {format.dateTime(new Date(`${post.publishedAt}T00:00:00Z`), {
              dateStyle: "medium",
              timeZone: "UTC",
            })}
          </time>
          {post.product !== "beui" ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{t(post.product)}</span>
            </>
          ) : null}
          {post.draft ? (
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px]">{t("draft")}</span>
          ) : null}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-balance text-foreground">
          {post.title}
        </h1>
      </header>

      {/* The cover repeats the title, so it is decorative here. */}
      <img
        src={blogCoverPath(post.slug)}
        alt=""
        width={2000}
        height={840}
        className="mt-8 aspect-[2000/840] w-full rounded-2xl border border-border bg-card object-cover"
      />

      <div className="mt-8">
        {blocks.map((block, index) =>
          block.type === "code" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: blocks are a fixed, ordered render of one post
            <div key={index} className="my-6">
              <CodeBlock {...block.code} />
            </div>
          ) : (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks are a fixed, ordered render of one post
              key={index}
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          ),
        )}
      </div>

      <SeoPageCta
        layout="card"
        browseHref="/components/motion"
        campaign={`blog_${post.slug.replace(/-/g, "_")}`}
        className="mt-12"
      />
    </article>
  );
}
