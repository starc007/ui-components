import { getGithubStarCount } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // A fixed key prevents query strings from bypassing the shared edge cache.
  const key = new Request(new URL("/api/github-stars", request.url));
  const cache = typeof caches !== "undefined"
    ? (caches as CacheStorage & { default?: Cache }).default
    : undefined;
  try {
    const cached = await cache?.match(key);
    if (cached) return cached;
  } catch (error) {
    console.error("GitHub star cache read failed", error);
  }

  const count = await getGithubStarCount();
  // Cache unavailable results briefly as well: upstream failures must not cause
  // every visitor to retry GitHub. No polling or background revalidation.
  const ttl = count === null ? 300 : 3600;
  const response = Response.json({ count }, {
    status: count === null ? 503 : 200,
    headers: {
      "Cache-Control": `public, max-age=${ttl}`,
      ...(count === null ? { "Retry-After": String(ttl) } : {}),
    },
  });
  if (cache) {
    try {
      await cache.put(key, response.clone());
    } catch (error) {
      console.error("GitHub star cache write failed", error);
    }
  }
  return response;
}
