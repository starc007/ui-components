import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";

/**
 * Registry installs happen via the shadcn CLI fetching `/r/{slug}.json`. That
 * request is headless (no browser, no gtag), and the route is force-static so
 * no per-request handler runs. Middleware runs on every request even for
 * static assets, so we tag installs here and report them to GA4 server-side
 * via the Measurement Protocol, keeping the route on the CDN.
 */
export const config = { matcher: "/r/:path*" };

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const GA_SECRET = process.env.GA_API_SECRET;

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const pass = NextResponse.next();

  const { pathname } = req.nextUrl;
  // Only the shadcn item endpoints (`/r/<slug>.json`) are real installs.
  // Skip the catalog and the raw-source / non-json sub-paths.
  if (
    !GA_ID ||
    !GA_SECRET ||
    !pathname.endsWith(".json") ||
    pathname === "/r/registry.json"
  ) {
    return pass;
  }

  const slug = pathname.slice("/r/".length, -".json".length);
  const ua = req.headers.get("user-agent") ?? "";

  event.waitUntil(reportInstall(slug, ua, req));
  return pass;
}

async function reportInstall(slug: string, ua: string, req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const clientId = await stableId(`${ip}|${ua}`);

    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_ID}&api_secret=${GA_SECRET}`,
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
