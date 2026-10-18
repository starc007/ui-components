import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { SeoPage } from "@/components/app/docs/seo-page";
import { findSeoPage } from "@/lib/seo-pages";
import type { AlternativePage } from "@/lib/seo-pages/types";

afterEach(cleanup);

test("comparison page exposes one heading outline, a labelled comparison table and an FAQ list", async () => {
  const source = findSeoPage("alternatives", "magic-ui") as AlternativePage | undefined;
  if (!source) throw new Error("magic-ui comparison page is missing");
  // Code blocks are async server components, so this render covers the prose and table.
  const page = { ...source, sections: source.sections.map(({ code: _code, ...section }) => section) };
  const { container, getAllByRole, getByRole } = render(<SeoPage kind="alternatives" page={page} />);

  expect(getAllByRole("heading", { level: 1 })).toHaveLength(1);
  const table = getByRole("table");
  expect(getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual(["Feature", "beUI", source.competitor]);
  expect(getAllByRole("rowheader")).toHaveLength(source.comparison.length);
  expect(table.querySelectorAll("tbody tr")).toHaveLength(source.comparison.length);
  expect(getByRole("heading", { level: 2, name: "FAQ" })).toBeTruthy();
  expect(getByRole("link", { name: `${source.competitor} official site` }).getAttribute("rel")).toContain("noopener");
  expect((await axe(container)).violations).toEqual([]);
});
