import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

// Every page path in every language, written by `scripts/list-pages.ts`
// (it needs the `@/` imports the config bundler can't resolve).
function prerenderPages(): { path: string }[] {
  try {
    const paths: string[] = JSON.parse(readFileSync(".build/pages.json", "utf8"));
    return paths.map((path) => ({ path }));
  } catch {
    return [{ path: "/" }];
  }
}

/**
 * The site is fully static. `vite build` prerenders every page (and the
 * static server function data behind client navigation) in Node, where the
 * build can read the repository. `scripts/build-static.ts` then writes the
 * registry endpoints, OG images, `_redirects` and `_headers` next to it, and
 * Cloudflare serves the whole `dist/client` folder as static assets. The
 * Worker in `worker/` only runs for the few paths listed in wrangler.jsonc.
 */
export default defineConfig({
  server: { port: 3000 },
  // Prerendering fetches every page from a `vite preview` server. Pin it to
  // IPv4: in build containers "localhost" can resolve to ::1 while the server
  // listens elsewhere, and every request then times out.
  preview: { host: "127.0.0.1" },
  resolve: { tsconfigPaths: true },
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      prerender: {
        enabled: true,
        // Pages are `/components/motion/button.html`, served at the
        // extensionless URL. A `button/index.html` would make Cloudflare
        // redirect every canonical URL to a trailing slash.
        autoSubfolderIndex: false,
        // The page list comes from .build/pages.json (scripts/list-pages.ts).
        // Start's own route discovery would add index routes by their full
        // path, "/charts/", and write a charts/index.html next to charts.html.
        autoStaticPathsDiscovery: false,
        crawlLinks: true,
        failOnError: true,
        // The preview server drops keep-alive sockets idle for 5s; while a slow
        // page renders, the next fetch can reuse one and get ECONNRESET. A
        // retry opens a new connection. Real render errors still fail after 3.
        retryCount: 3,
        retryDelay: 500,
        // Build machines report many cores; fewer parallel renders keep each
        // page fast enough that sockets don't sit idle.
        concurrency: 6,
        // Link crawling only finds pages; machine files come from build-static.
        // /components is a redirect, served from _redirects. A trailing-slash
        // path would write a second index.html for the same URL, so skip it.
        filter: ({ path }) => {
          const pathname = path.split(/[?#]/)[0];
          if (pathname.length > 1 && pathname.endsWith("/")) return false;
          return (
            !/\.[a-z]+$/i.test(pathname) &&
            !/^\/(?:r|native\/r)(?:\/|$)/.test(pathname) &&
            pathname !== "/components"
          );
        },
      },
      pages: prerenderPages(),
    }),
    viteReact(),
  ],
});
