import { afterAll, afterEach, expect, spyOn, test } from "bun:test";
import { GET } from "../app/api/github-stars/route";

const fetchSpy = spyOn(globalThis, "fetch");
afterAll(() => fetchSpy.mockRestore());
const originalCaches = Object.getOwnPropertyDescriptor(globalThis, "caches");
afterEach(() => {
  fetchSpy.mockReset();
  if (originalCaches) Object.defineProperty(globalThis, "caches", originalCaches);
  else Reflect.deleteProperty(globalThis, "caches");
});

function edgeCache() {
  const entries = new Map<string, Response>();
  Object.defineProperty(globalThis, "caches", { configurable: true, value: {
    default: {
      match: async (key: Request) => entries.get(key.url)?.clone(),
      put: async (key: Request, response: Response) => { entries.set(key.url, response); },
    },
  } });
}

test("shares counts across visitors and ignores query cache-busters", async () => {
  edgeCache();
  fetchSpy.mockResolvedValue(Response.json({ stargazers_count: 1234 }));
  const response = await GET(new Request("https://beui.dev/api/github-stars"));
  expect(await response.json()).toEqual({ count: 1234 });
  expect(response.headers.get("cache-control")).toContain("max-age=3600");
  const second = await GET(new Request("https://beui.dev/api/github-stars?random=123"));
  expect(await second.json()).toEqual({ count: 1234 });
  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(fetchSpy.mock.calls[0]?.[1]?.cache).toBe("no-store");
});

test("caches upstream rate limits briefly instead of retrying for every visitor", async () => {
  edgeCache();
  fetchSpy.mockResolvedValue(new Response(null, { status: 403 }));
  const response = await GET(new Request("https://beui.dev/api/github-stars"));
  expect(response.status).toBe(503);
  expect(response.headers.get("retry-after")).toBe("300");
  await GET(new Request("https://beui.dev/api/github-stars"));
  expect(fetchSpy).toHaveBeenCalledTimes(1);
});

test("rejects malformed upstream counts and handles network failure", async () => {
  fetchSpy.mockResolvedValueOnce(Response.json({ stargazers_count: -1 }));
  expect((await GET(new Request("https://beui.dev/api/github-stars"))).status).toBe(503);
  fetchSpy.mockRejectedValueOnce(new Error("network unavailable"));
  expect((await GET(new Request("https://beui.dev/api/github-stars"))).status).toBe(503);
});
