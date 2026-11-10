// The only code that runs per request. Everything else on beui.dev is a static
// asset (wrangler.jsonc `assets`), which Cloudflare serves without invoking
// this Worker. It runs first only for the paths in `run_worker_first`:
//   /r, /r/*, /native/r, /native/r/*  registry endpoints: extensionless JSON and
//                                     text need their content types and exact
//                                     headers, which static assets can't set per file
//   /api/*                            GitHub stars, old social card URLs
import { trackAiCrawler } from "tracwell/server";
import { getGithubStarCount } from "../lib/github";

type Env = {
  ASSETS: Fetcher;
  TRACWELL_SERVER_KEY?: string;
};

type WorkerRoute = { asset: string; headers: Record<string, string> };

// Path → stored body and exact headers, written by scripts/build-static.ts.
// Read once per isolate.
let registry: Promise<Record<string, WorkerRoute>> | undefined;
function loadRegistry(env: Env, url: URL) {
  registry ??= env.ASSETS.fetch(new URL("/__worker/routes.json", url)).then((response) => {
    if (!response.ok) throw new Error(`Registry routes missing: ${response.status}`);
    return response.json();
  });
  registry.catch(() => {
    registry = undefined;
  });
  return registry;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : url.pathname;

    if (env.TRACWELL_SERVER_KEY) {
      const serverKey = env.TRACWELL_SERVER_KEY;
      ctx.waitUntil(
        trackAiCrawler(request, { serverKey }).then((result) => {
          if (result.status === "failed") console.warn("Tracwell crawler tracking failed:", result.code);
        }),
      );
    }

    if (pathname === "/api/github-stars") return githubStars(request, ctx);
    if (pathname === "/api/og") return legacyOgCard(url, env);

    const isRegistryPath = /^\/(?:r|native\/r)(?:\/|$)/.test(pathname);
    const route = isRegistryPath ? (await loadRegistry(env, url))[pathname] : undefined;
    if (route && (request.method === "GET" || request.method === "HEAD")) {
      const asset = await env.ASSETS.fetch(new URL(route.asset, url));
      return new Response(request.method === "HEAD" ? null : asset.body, {
        status: asset.status,
        headers: route.headers,
      });
    }
    if (route && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: route.headers });
    }
    if (isRegistryPath) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    // Any other path that reached the Worker: hand it to the asset server
    // (static files, then the 404 page).
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

// ---------------------------------------------------------------------------

async function githubStars(request: Request, ctx: ExecutionContext) {
  // A fixed key prevents query strings from bypassing the shared edge cache.
  const key = new Request(new URL("/api/github-stars", request.url));
  const cache = caches.default;
  try {
    const cached = await cache.match(key);
    if (cached) return cached;
  } catch (error) {
    console.error("GitHub star cache read failed", error);
  }

  const count = await getGithubStarCount();
  // Cache unavailable results briefly as well: upstream failures must not cause
  // every visitor to retry GitHub. No polling or background revalidation.
  const ttl = count === null ? 300 : 3600;
  const response = Response.json(
    { count },
    {
      status: count === null ? 503 : 200,
      headers: {
        "Cache-Control": `public, max-age=${ttl}`,
        ...(count === null ? { "Retry-After": String(ttl) } : {}),
      },
    },
  );
  ctx.waitUntil(
    cache.put(key, response.clone()).catch((error) => console.error("GitHub star cache write failed", error)),
  );
  return response;
}

// Social sites keep the old /api/og?… image URLs. Point them at the static
// card, in the old route's order: native, component, category, page, guide,
// alternative, else the default card.
const OG_PARAMS = ["native", "component", "category", "page", "guide", "alternative"] as const;

async function legacyOgCard(url: URL, env: Env) {
  for (const kind of OG_PARAMS) {
    const slug = url.searchParams.get(kind);
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) continue;
    const path = `/og/cards/${kind}/${slug}.png`;
    const head = await env.ASSETS.fetch(new Request(new URL(path, url), { method: "HEAD" }));
    if (head.ok) return Response.redirect(new URL(path, url).toString(), 301);
  }
  return Response.redirect(new URL("/og/cards/default.png", url).toString(), 301);
}
