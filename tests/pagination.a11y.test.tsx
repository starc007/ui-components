import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Pagination } from "@/components/motion/pagination";

afterEach(cleanup);

test("pagination names its landmark, marks the current page and names each jump", async () => {
  const { container, getByRole } = render(<Pagination totalPages={20} defaultPage={10} />);
  expect(getByRole("navigation", { name: "Pagination" })).toBeTruthy();
  expect(getByRole("button", { name: "Page 10" }).getAttribute("aria-current")).toBe("page");
  expect(getByRole("button", { name: "Back 5 pages" })).toBeTruthy();
  expect(getByRole("button", { name: "Forward 5 pages" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("the previous control is disabled on the first page and next moves the current page", async () => {
  const { container, getByRole } = render(<Pagination totalPages={8} />);
  expect((getByRole("button", { name: "Previous page" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(getByRole("button", { name: "Next page" }));
  expect(getByRole("button", { name: "Page 2" }).getAttribute("aria-current")).toBe("page");
  expect((await axe(container)).violations).toEqual([]);
});

test("link pagination renders named links with the current page marked", async () => {
  const { container, getByRole } = render(
    <Pagination totalPages={12} page={12} getHref={(page) => `?page=${page}`} aria-label="Results pages" />,
  );
  expect(getByRole("navigation", { name: "Results pages" })).toBeTruthy();
  const current = getByRole("link", { name: "Page 12" });
  expect(current.getAttribute("aria-current")).toBe("page");
  expect(current.getAttribute("href")).toBe("?page=12");
  expect((getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
});
