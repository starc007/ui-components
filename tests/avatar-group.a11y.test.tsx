import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { AvatarGroup } from "@/components/motion/avatar-group";

afterEach(cleanup);

const MEMBERS = [
  { id: "a", name: "Maya Chen", src: "https://example.com/maya.jpg" },
  { id: "b", name: "Leo Hart" },
  { id: "c", name: "Ines Duarte" },
  { id: "d", name: "Sam Okafor" },
  { id: "e", name: "Noah Berg" },
];

test("avatar group names its list and every visible member, with a collapsed overflow button", async () => {
  const { container, getByRole, getByText } = render(
    <AvatarGroup members={MEMBERS} max={3} label="Project members" />,
  );
  expect(getByRole("list", { name: "Project members" })).toBeTruthy();
  expect(getByRole("img", { name: "Maya Chen" })).toBeTruthy();
  expect(getByText("Leo Hart")).toBeTruthy();
  const more = getByRole("button", { name: "Show 2 more members" });
  expect(more.getAttribute("aria-expanded")).toBe("false");
  expect((await axe(container)).violations).toEqual([]);
});

test("expanding the group shows every member and flips the button", async () => {
  const { container, getByRole, getByText } = render(<AvatarGroup members={MEMBERS} max={3} />);
  fireEvent.click(getByRole("button", { name: "Show 2 more members" }));
  const less = getByRole("button", { name: "Show fewer members" });
  expect(less.getAttribute("aria-expanded")).toBe("true");
  expect(getByText("Noah Berg")).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});
