import { describe, expect, test } from "bun:test";
import {
  GET,
  generateStaticParams,
} from "@/app/docs/[slug]/route";
import { buildGuideMarkdown, GUIDE_SLUGS } from "@/lib/guide-markdown";

describe("guide Markdown", () => {
  test("builds every published guide with canonical frontmatter", () => {
    expect(GUIDE_SLUGS).toEqual([
      "motion-patterns",
      "ai-agents",
      "openui",
    ]);

    for (const slug of GUIDE_SLUGS) {
      const markdown = buildGuideMarkdown(slug);
      expect(markdown).toContain(`documentation: "https://beui.dev/docs/${slug}"`);
      expect(markdown).toContain(`markdown: "https://beui.dev/docs/${slug}.md"`);
      expect(markdown).toContain("\n## ");
    }
  });

  test("publishes static .md params", () => {
    expect(generateStaticParams()).toEqual(
      GUIDE_SLUGS.map((slug) => ({ slug: `${slug}.md` })),
    );
  });

  test("serves Markdown with discovery headers", async () => {
    const response = await GET(new Request("https://beui.dev/docs/openui.md"), {
      params: Promise.resolve({ slug: "openui.md" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
    expect(response.headers.get("link")).toContain("</docs/openui>");
    expect(await response.text()).toContain("# Use beUI with OpenUI");
  });

  test("rejects unknown or non-Markdown guide paths", async () => {
    const unknown = await GET(new Request("https://beui.dev/docs/unknown.md"), {
      params: Promise.resolve({ slug: "unknown.md" }),
    });
    const html = await GET(new Request("https://beui.dev/docs/openui"), {
      params: Promise.resolve({ slug: "openui" }),
    });

    expect(unknown.status).toBe(404);
    expect(html.status).toBe(404);
  });
});
