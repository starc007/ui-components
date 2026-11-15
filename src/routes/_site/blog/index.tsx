import { createFileRoute } from "@tanstack/react-router";
import { BlogIndex } from "@/components/app/blog/blog-index";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { metadataToHead } from "@/lib/head";
import { getBlogIndex } from "../../-pages/blog-page";

export const Route = createFileRoute("/_site/blog/")({
  loader: () => getBlogIndex(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    const { posts } = Route.useLoaderData();
    return (
      <>
        <BlogIndex posts={posts} />
        <SiteFooter />
      </>
    );
  },
});
