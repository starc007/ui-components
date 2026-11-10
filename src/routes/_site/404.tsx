import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "../-not-found";

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
    const text = layout?.messages.Chrome.notFound;
    return {
      meta: [
        ...(text
          ? [{ title: `${text.title} · beUI` }, { name: "description", content: text.description }]
          : []),
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: NotFoundPage,
});
