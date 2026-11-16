import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { DownloadButton } from "@/components/motion/download-button";
import { LockToggle } from "@/components/motion/lock-toggle";
import { MessageStatus } from "@/components/motion/message-status";
import { MuteToggle } from "@/components/motion/mute-toggle";
import { NotificationBell } from "@/components/motion/notification-bell";
import { PollVote } from "@/components/motion/poll-vote";
import { ReactionPicker } from "@/components/motion/reaction-picker";
import { RefreshButton } from "@/components/motion/refresh-button";
import { SendButton } from "@/components/motion/send-button";
import { ShareButton } from "@/components/motion/share-button";

afterEach(cleanup);

test("mute and lock toggles expose a steady name and their state", async () => {
  const { container, getByRole } = render(
    <div>
      <MuteToggle />
      <LockToggle />
    </div>,
  );
  const mute = getByRole("button", { name: "Mute" });
  const lock = getByRole("button", { name: "Lock" });
  expect(mute.getAttribute("aria-pressed")).toBe("false");
  expect(lock.getAttribute("aria-pressed")).toBe("true");
  await act(async () => {
    fireEvent.click(mute);
    fireEvent.click(lock);
  });
  expect(mute.getAttribute("aria-pressed")).toBe("true");
  expect(lock.getAttribute("aria-pressed")).toBe("false");
  expect((await axe(container)).violations).toEqual([]);
});

test("notification bell reads its unread count and clears it", async () => {
  const { container, getByRole } = render(<NotificationBell defaultCount={3} />);
  await act(async () => fireEvent.click(getByRole("button", { name: "Notifications, 3 unread" })));
  expect(getByRole("button", { name: "Notifications" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("send, download and refresh report busy while they run", async () => {
  const pending = () => new Promise(() => {});
  const { container, getByRole } = render(
    <div>
      <SendButton onSend={pending} />
      <DownloadButton onDownload={pending} />
      <RefreshButton onRefresh={pending} />
    </div>,
  );
  expect((await axe(container)).violations).toEqual([]);
  await act(async () => {
    fireEvent.click(getByRole("button", { name: "Send" }));
    fireEvent.click(getByRole("button", { name: "Download" }));
    fireEvent.click(getByRole("button", { name: "Refresh" }));
  });
  expect(getByRole("button", { name: "Sending" }).getAttribute("aria-busy")).toBe("true");
  expect(getByRole("button", { name: "Refreshing" }).getAttribute("aria-busy")).toBe("true");
  expect(getByRole("progressbar", { name: "Download progress" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("message status is named for its state", async () => {
  const { container, getByRole, getByText } = render(
    <div>
      <MessageStatus status="delivered" />
      <MessageStatus status="read" showLabel />
    </div>,
  );
  expect(getByRole("img", { name: "Delivered" })).toBeTruthy();
  expect(getByText("Read", { selector: ".sr-only" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("reaction picker opens a named tray and takes a reaction", async () => {
  const { container, getByRole } = render(<ReactionPicker count={2} />);
  const trigger = getByRole("button", { name: "Add reaction" });
  await act(async () => fireEvent.click(trigger));
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(getByRole("group", { name: "Reactions" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
  await act(async () => fireEvent.click(getByRole("button", { name: "Love" })));
  expect(getByRole("button", { name: "Reacted with Love" })).toBeTruthy();
});

test("share button fans out named actions and folds back on close", async () => {
  const { container, getByRole, queryByRole } = render(<ShareButton />);
  const trigger = getByRole("button", { name: "Share" });
  await act(async () => fireEvent.click(trigger));
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(getByRole("button", { name: "Copy link" })).toBeTruthy();
  expect(getByRole("button", { name: "Email" })).toBeTruthy();
  expect(getByRole("button", { name: "Message" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
  await act(async () => {
    fireEvent.click(getByRole("button", { name: "Close" }));
    // Let the fan fold home.
    await new Promise((resolve) => setTimeout(resolve, 600));
  });
  expect(queryByRole("button", { name: "Copy link" })).toBeNull();
  expect(getByRole("button", { name: "Share" })).toBeTruthy();
});

test("poll vote names each option with its share once voted", async () => {
  const options = [
    { id: "a", label: "Springs", votes: 3 },
    { id: "b", label: "Curves", votes: 1 },
  ];
  const { container, getByRole } = render(<PollVote options={options} />);
  await act(async () => fireEvent.click(getByRole("button", { name: "Springs" })));
  expect(getByRole("button", { name: "Springs, 80%" }).getAttribute("aria-pressed")).toBe("true");
  expect(getByRole("button", { name: "Curves, 20%" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});
