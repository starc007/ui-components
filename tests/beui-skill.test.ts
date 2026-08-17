import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { allShadcnTargets, buildShadcnRegistry } from "@/lib/registry-server";

const ROOT = path.join(import.meta.dir, "..");
const SKILL_PATH = path.join(ROOT, "skills/beui/SKILL.md");
const EVALS_PATH = path.join(ROOT, "skills/beui/evals.json");
const CATALOG_PATH = path.join(ROOT, "skills/beui/catalog.md");
const LIVE_REGISTRY = "https://beui.dev/r/registry.json";

type SkillEvals = {
  skill_name: string;
  evals: Array<{
    id: string;
    prompt: string;
    expected_slugs: string[];
    not_slugs: string[];
  }>;
};

function installSlugs() {
  return new Set(allShadcnTargets().map((target) => target.slug));
}

function slugsFromSkill(markdown: string) {
  const found = new Set<string>();

  for (const match of markdown.matchAll(/@beui\/([a-z][a-z0-9-]*)/g)) {
    found.add(match[1]);
  }

  for (const match of markdown.matchAll(
    /https:\/\/beui\.dev\/r\/([a-z][a-z0-9-]*)(?:\.json)?/g,
  )) {
    if (match[1] === "registry") continue;
    found.add(match[1]);
  }

  for (const line of markdown.split("\n")) {
    if (!line.includes("|")) continue;
    for (const match of line.matchAll(/`([a-z][a-z0-9-]*)`/g)) {
      found.add(match[1]);
    }
  }

  return [...found];
}

describe("beUI skill", () => {
  test("README documents a non-interactive skill install", async () => {
    const readme = await readFile(path.join(ROOT, "README.md"), "utf8");
    expect(readme).toContain("npx skills add starc007/ui-components --skill beui");
    expect(readme).not.toContain("npx skills add https://beui.dev");
  });

  test("keeps the live registry as the source of truth", async () => {
    const skill = await readFile(SKILL_PATH, "utf8");

    expect(existsSync(CATALOG_PATH)).toBe(false);
    expect(skill).toContain("curl -fsS https://beui.dev/r/registry.json");
    expect(skill).toContain("items[].name");
    expect(skill).toContain("The live registry is the source of truth");
    expect(skill).not.toContain("!`curl");
    expect(skill).not.toContain("when this skill loads");
    expect(skill).not.toContain("catalog.md");
  });

  test("every picker slug is a real @beui install name", async () => {
    const skill = await readFile(SKILL_PATH, "utf8");
    const known = installSlugs();
    const missing = slugsFromSkill(skill).filter((slug) => !known.has(slug));

    expect(missing).toEqual([]);
  });

  test("local registry.json is a scrapeable catalog of install slugs", async () => {
    const registry = await buildShadcnRegistry();
    const names = registry.items.map((item) => item.name);

    expect(registry.name).toBe("beui");
    expect(names.length).toBeGreaterThan(40);
    expect(new Set(names).size).toBe(names.length);

    for (const item of registry.items) {
      expect(item.name).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.files.length).toBeGreaterThan(0);
    }

    const skill = await readFile(SKILL_PATH, "utf8");
    const missing = slugsFromSkill(skill).filter((slug) => !names.includes(slug));
    expect(missing).toEqual([]);
  });

  test("picker evals point at real slugs", async () => {
    const known = installSlugs();
    const evals = JSON.parse(await readFile(EVALS_PATH, "utf8")) as SkillEvals;

    expect(evals.skill_name).toBe("beui");
    expect(evals.evals.length).toBeGreaterThan(5);

    for (const item of evals.evals) {
      expect(item.prompt.length).toBeGreaterThan(0);
      expect(item.expected_slugs.length).toBeGreaterThan(0);

      for (const slug of [...item.expected_slugs, ...item.not_slugs]) {
        expect(known.has(slug)).toBe(true);
      }

      const overlap = item.expected_slugs.filter((slug) =>
        item.not_slugs.includes(slug),
      );
      expect(overlap).toEqual([]);
    }
  });

  test("production registry.json can be fetched with the skill command", async () => {
    const proc = Bun.spawn(["curl", "-fsS", LIVE_REGISTRY], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const code = await proc.exited;

    expect(code, stderr || `curl exited ${code}`).toBe(0);

    const catalog = JSON.parse(stdout) as {
      name?: string;
      items?: Array<{ name?: string; title?: string; description?: string }>;
    };

    expect(catalog.name).toBe("beui");
    expect(Array.isArray(catalog.items)).toBe(true);
    expect(catalog.items?.length).toBeGreaterThan(40);

    for (const item of catalog.items ?? []) {
      expect(item.name).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
    }
  });
});
