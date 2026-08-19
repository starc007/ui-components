import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { ReasoningText } from "@/components/agents/loading-states/reasoning-text";
import { TextShimmer } from "@/components/motion/text-shimmer";
import { TEXT_SHIMMER_CLASS_NAME } from "@/lib/text-shimmer";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);

const REDUCED_MOTION_RULE = /@media\s*\(prefers-reduced-motion:\s*reduce\)/;

describe("TextShimmer", () => {
  test("stops the sweep under reduced motion", () => {
    const { container } = render(<TextShimmer>Loading projects…</TextShimmer>);
    const style = container.querySelector("style");
    const shimmer = container.querySelector(".beui-text-shimmer");

    // The rule has to be `!important`: the animation is an inline style, and an
    // inline declaration outranks a plain rule in a media query.
    expect(style?.textContent).toMatch(REDUCED_MOTION_RULE);
    expect(style?.textContent).toContain(".beui-text-shimmer");
    expect(style?.textContent).toContain("!important");
    expect(shimmer).not.toBeNull();
  });

  test("carries the marker class on every shimmering element", () => {
    // ReasoningText builds its own spans out of the class and the style rather
    // than using TextShimmer, so the rule only reaches it through the class.
    const { container } = render(<ReasoningText />);
    const shimmering = container.querySelectorAll('[style*="beui-text-shimmer"]');

    expect(shimmering.length).toBeGreaterThan(0);
    for (const element of shimmering) {
      expect(element.className).toContain("beui-text-shimmer");
    }
  });

  test("ships the reduced-motion rule to consumers", async () => {
    // The docs site neutralises CSS animation globally in app/globals.css, which
    // the registry does not bundle. Without this the rule reaches beui.dev only.
    const item = await buildShadcnItem("motion", "text-shimmer");
    const lib = item?.files.find((file) => file.path === "lib/text-shimmer.ts");

    expect(lib?.content).toMatch(REDUCED_MOTION_RULE);
  });
});

describe("TEXT_SHIMMER_CLASS_NAME", () => {
  test("carries the marker the reduced-motion rule selects", () => {
    expect(TEXT_SHIMMER_CLASS_NAME).toContain("beui-text-shimmer");
  });
});
