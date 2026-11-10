// The only code that runs per request. Everything else on beui.dev is a static
// asset (wrangler.jsonc `assets`), which Cloudflare serves without invoking
// this Worker. It runs first only for the paths in `run_worker_first`:
//   /r, /r/*, /native/r, /native/r/*  registry endpoints (install analytics)
//   /api/*                            GitHub stars, old social card URLs
import { trackAiCrawler } from "tracwell/server";
import { getGithubStarCount } from "../lib/github";

type Env = {
  ASSETS: Fetcher;
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
  GA_API_SECRET?: string;
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
      if (pathname.startsWith("/r/") && pathname.endsWith(".json") && pathname !== "/r/registry.json") {
        ctx.waitUntil(reportInstall(pathname.slice(3, -5), request, env));
      }
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

/**
 * Registry installs come from the shadcn CLI fetching `/r/{slug}.json`: a
 * headless request with no gtag. Report them to GA4 server-side via the
 * Measurement Protocol.
 */
async function reportInstall(slug: string, request: Request, env: Env) {
  const measurementId = env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const apiSecret = env.GA_API_SECRET;
  if (!measurementId || !apiSecret) return;
  const ua = request.headers.get("user-agent") ?? "";
  try {
    const ip = request.headers.get("cf-connecting-ip") ?? "";
    const clientId = await stableId(`${ip}|${ua}`);
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          events: [
            {
              name: "registry_install",
              params: {
                slug,
                user_agent: ua.slice(0, 100),
                // shadcn CLI runs on node; helps segment installs from bots/browsers.
                is_cli: /node|shadcn|bun|undici/i.test(ua),
              },
            },
          ],
        }),
      },
    );
  } catch {
    // Analytics is best-effort; never fail the install fetch.
  }
}

// GA4 needs a stable-ish client_id. Hash ip+ua so repeat installs from one
// machine group, without storing anything or setting a cookie.
async function stableId(seed: string) {
  const data = new TextEncoder().encode(seed || "anon");
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
