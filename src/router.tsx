import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    // Page data is static JSON built with the site; it never goes stale.
    defaultStaleTime: Number.POSITIVE_INFINITY,
    defaultPreloadStaleTime: Number.POSITIVE_INFINITY,
    scrollRestoration: true,
    defaultStructuralSharing: false,
  });
}
