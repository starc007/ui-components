import { createFileRoute, notFound } from "@tanstack/react-router";

// Unmatched paths land here; the site layout renders the 404.
export const Route = createFileRoute("/_site/$")({
  beforeLoad: () => {
    throw notFound();
  },
});
