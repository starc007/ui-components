import { createFileRoute } from "@tanstack/react-router";
import { BlogPost } from "@/components/app/blog/blog-post";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { metadataToHead } from "@/lib/head";
import { loadBlogPost } from "../../-pages/blog-page";

export const Route = createFileRoute("/_site/blog/$slug")({
  loader: ({ params }) => loadBlogPost(params.slug),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    const { post, blocks } = Route.useLoaderData();
    return (
      <>
        <BlogPost post={post} blocks={blocks} />
        <SiteFooter />
      </>
    );
  },
});
