import { Rss } from "lucide-react";
import { useFormatter, useTranslations } from "use-intl";
import type { BlogPostMeta } from "@/lib/blog";
import { Link } from "@/lib/navigation";
import { blogCoverPath, ogImagePath } from "@/lib/og-paths";
import { cn } from "@/lib/utils";

/**
 * The /blog list: one banner card per post, newest first. The newest post
 * spans the row with its wide cover; the rest use the 1200x630 card.
 */
export function BlogIndex({ posts }: { posts: BlogPostMeta[] }) {
  const t = useTranslations("Native.blog");
  const format = useFormatter();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <header className="flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-medium tracking-tight text-foreground">{t("heading")}</h1>
          <p className="mt-3 text-muted-foreground">{t("intro")}</p>
        </div>
        <a
          href="/blog/rss.xml"
          className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Rss aria-hidden="true" className="size-3.5" />
          {t("rss")}
        </a>
      </header>
      {posts.length ? (
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts.map((post, index) => {
            const featured = index === 0;
            const meta = [
              format.dateTime(new Date(`${post.publishedAt}T00:00:00Z`), {
                dateStyle: "medium",
                timeZone: "UTC",
              }),
              post.product === "pro" ? t("pro") : null,
              post.draft ? t("draft") : null,
            ].filter(Boolean);
            return (
              <li key={post.slug} className={cn("flex", featured && "sm:col-span-2")}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex w-full flex-col rounded-2xl border border-border p-2 outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* The banner repeats the title below it, so it is decorative. */}
                  <img
                    src={featured ? blogCoverPath(post.slug) : ogImagePath("blog", post.slug)}
                    alt=""
                    width={featured ? 2000 : 1200}
                    height={featured ? 840 : 630}
                    loading={featured ? "eager" : "lazy"}
                    className={cn(
                      // Concentric with the card: 16px radius minus the 8px inset.
                      "w-full rounded-lg bg-card object-cover",
                      featured ? "aspect-[2000/840]" : "aspect-[1200/630]",
                    )}
                  />
                  <span className="flex flex-col gap-1 px-2 pt-3 pb-2">
                    <span className="text-xs text-muted-foreground">{meta.join(" · ")}</span>
                    <span
                      className={cn(
                        "font-medium text-foreground text-balance",
                        featured ? "text-lg" : "text-sm",
                      )}
                    >
                      {post.title}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">{t("empty")}</p>
      )}
    </div>
  );
}
