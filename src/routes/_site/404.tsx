import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage, notFoundMeta } from "../-not-found";

/**
 * Prerendered as /404.html. Cloudflare serves it, with a 404 status, for any
 * path that has no static file (wrangler.jsonc `not_found_handling`).
 * Prerendering needs a 200, hence a real route.
 */
export const Route = createFileRoute("/_site/404")({
  head: ({ matches }) => {
    const layout = matches.find((match) => (match.routeId as string) === "/_site")?.loaderData as
      | { messages: { Chrome: { notFound: { title: string; description: string } } } }
      | undefined;
    return { meta: notFoundMeta(layout?.messages.Chrome.notFound) };
  },
  component: NotFoundPage,
});
