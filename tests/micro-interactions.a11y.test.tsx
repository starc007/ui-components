import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { AddToCart } from "@/components/motion/add-to-cart";
import { BookmarkButton } from "@/components/motion/bookmark-button";
import { CopyButton } from "@/components/motion/copy-button";
import { FollowButton } from "@/components/motion/follow-button";
import { LikeButton } from "@/components/motion/like-button";
import { StarRating } from "@/components/motion/star-rating";
import { TextMorph } from "@/components/motion/text-morph";
import { UpvoteButton } from "@/components/motion/upvote-button";

afterEach(cleanup);

test("toggle buttons expose their pressed state", async () => {
  const { container, getByRole } = render(
    <div>
      <LikeButton count={4} />
      <BookmarkButton />
      <UpvoteButton count={10} />
      <FollowButton name="Maya" />
    </div>,
  );
  for (const name of ["Like", "Save", "Upvote", "Follow Maya"]) {
    const button = getByRole("button", { name });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    await act(async () => fireEvent.click(button));
    expect(button.getAttribute("aria-pressed")).toBe("true");
  }
  expect((await axe(container)).violations).toEqual([]);
});

test("copy button has no violations", async () => {
  const { container, getAllByRole } = render(
    <div>
      <CopyButton value="hello" />
      <CopyButton value="hello" showLabel />
    </div>,
  );
  // Icon only (aria-label) and labelled (visible text) both read "Copy".
  expect(getAllByRole("button", { name: "Copy" })).toHaveLength(2);
  expect((await axe(container)).violations).toEqual([]);
});

test("text morph reads its whole string, not the animated letters", async () => {
  const { container, getByRole, rerender } = render(
    <button type="button">
      <TextMorph>Subscribe</TextMorph>
    </button>,
  );
  expect(getByRole("button", { name: "Subscribe" })).toBeTruthy();
  rerender(
    <button type="button">
      <TextMorph>Subscribed</TextMorph>
    </button>,
  );
  expect(getByRole("button", { name: "Subscribed" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("star rating is a radio group with one tab stop", async () => {
  const { container, getByRole, getAllByRole } = render(<StarRating defaultValue={2} />);
  expect(getByRole("radiogroup", { name: "Rating" })).toBeTruthy();
  const stars = getAllByRole("radio");
  expect(stars.filter((star) => star.tabIndex === 0)).toHaveLength(1);
  expect(stars[1].getAttribute("aria-checked")).toBe("true");
  await act(async () => fireEvent.keyDown(stars[1], { key: "ArrowRight" }));
  expect(getByRole("radio", { name: "3 of 5 stars" }).getAttribute("aria-checked")).toBe("true");
  expect((await axe(container)).violations).toEqual([]);
});

test("add to cart swaps to a named stepper", async () => {
  const { container, getByRole } = render(<AddToCart />);
  await act(async () => fireEvent.click(getByRole("button", { name: "Add to cart" })));
  expect(getByRole("button", { name: "Remove from cart" })).toBeTruthy();
  await act(async () => fireEvent.click(getByRole("button", { name: "Add one" })));
  expect(getByRole("button", { name: "Remove one" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});
