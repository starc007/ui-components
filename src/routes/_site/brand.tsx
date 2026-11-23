import { createFileRoute } from "@tanstack/react-router";
import { BrandPage } from "../-pages/brand-page";

export const Route = createFileRoute("/_site/brand")({
  head: () => ({ meta: [{ title: "Brand · beUI" }, { name: "robots", content: "noindex" }] }),
  component: BrandPage,
});
