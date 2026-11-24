import { createFileRoute, notFound } from "@tanstack/react-router";
import { BrandPage } from "../-pages/brand-page";

// An internal reference page for local work. It is never prerendered, so in a
// production build a client-side visit would otherwise still render it.
export const Route = createFileRoute("/_site/brand")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  head: () => ({ meta: [{ title: "Brand · beUI" }, { name: "robots", content: "noindex" }] }),
  component: BrandPage,
});
