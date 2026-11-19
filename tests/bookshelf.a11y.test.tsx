import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Bookshelf } from "@/components/motion/bookshelf";
import { BookshelfPreview } from "@/components/previews/motion/bookshelf.preview";

afterEach(cleanup);

const BOOKS = [
  { id: "walden", title: "Walden", author: "Henry David Thoreau", color: "#5b6248" },
  { id: "meditations", title: "Meditations", color: "#2f3a4a" },
  { id: "moby-dick", title: "Moby-Dick", author: "Herman Melville", color: "#1f4e79" },
];

test("bookshelf lists named toggle buttons that open with the keyboard", async () => {
  const { container, getByRole } = render(<Bookshelf books={BOOKS} />);

  expect(getByRole("list", { name: "Bookshelf" })).toBeTruthy();
  const walden = getByRole("button", { name: "Walden by Henry David Thoreau" });
  const meditations = getByRole("button", { name: "Meditations" });
  expect(walden.getAttribute("aria-pressed")).toBe("false");

  act(() => {
    walden.focus();
    fireEvent.click(walden);
  });
  expect(walden.getAttribute("aria-pressed")).toBe("true");

  act(() => {
    fireEvent.keyDown(walden, { key: "ArrowRight" });
  });
  expect(document.activeElement).toBe(meditations);
  expect(meditations.getAttribute("aria-pressed")).toBe("true");
  expect(walden.getAttribute("aria-pressed")).toBe("false");

  act(() => {
    fireEvent.keyDown(meditations, { key: "Escape" });
  });
  expect(meditations.getAttribute("aria-pressed")).toBe("false");
  expect((await axe(container)).violations).toEqual([]);
});

test("bookshelf preview passes axe with a book open", async () => {
  const { container } = render(<BookshelfPreview />);
  expect((await axe(container)).violations).toEqual([]);
});
