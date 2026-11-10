import { createFileRoute, notFound } from "@tanstack/react-router";

// Unmatched paths land here; the locale layout renders the localized 404.
export const Route = createFileRoute("/{-$locale}/$")({
  beforeLoad: () => {
    throw notFound();
  },
});
