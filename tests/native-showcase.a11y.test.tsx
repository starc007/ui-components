import { afterEach, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { QrCode } from "@/components/app/docs/native/qr-code";
import { withIntl } from "./intl";

// The platform switch reads the route and navigates; stand in for the router.
let pathname = "/";
const push = mock((_href: string) => {});
// Bun module mocks are process-wide, so keep the real exports other test files use.
const realNavigation = { ...(await import("@/i18n/navigation")) };
mock.module("@/i18n/navigation", () => ({
  ...realNavigation,
  usePathname: () => pathname,
  useRouter: () => ({ push }),
}));
const { PlatformSwitch } = await import("@/components/app/docs/native/platform-switch");

afterEach(() => {
  cleanup();
  push.mockClear();
});

async function choose(name: string, getByRole: ReturnType<typeof render>["getByRole"]) {
  await act(async () => {
    fireEvent.click(getByRole("tab", { name }));
  });
}

test("the platform switch is a labelled tablist that follows the route", async () => {
  pathname = "/components/motion/tabs";
  const { container, getByRole } = render(withIntl(<PlatformSwitch />));
  expect(getByRole("tablist", { name: "Platform" })).toBeTruthy();
  expect(getByRole("tab", { name: "Web" }).getAttribute("aria-selected")).toBe("true");
  expect((await axe(container)).violations).toEqual([]);

  await choose("React Native", getByRole);
  expect(push).toHaveBeenCalledWith("/react-native/tabs");
});

test("a React Native page selects its tab and links back to the web page", async () => {
  pathname = "/react-native/tabs";
  const { getByRole } = render(withIntl(<PlatformSwitch />));
  expect(
    getByRole("tab", { name: "React Native" }).getAttribute("aria-selected"),
  ).toBe("true");

  await choose("Web", getByRole);
  expect(push).toHaveBeenCalledWith("/components/motion/tabs");
});

test("a page without a counterpart switches to that platform's list", async () => {
  pathname = "/components/motion/aspect-ratio";
  const web = render(withIntl(<PlatformSwitch />));
  await choose("React Native", web.getByRole);
  expect(push).toHaveBeenLastCalledWith("/react-native");
  cleanup();

  pathname = "/react-native";
  const native = render(withIntl(<PlatformSwitch />));
  await choose("Web", native.getByRole);
  expect(push).toHaveBeenLastCalledWith("/components/motion");
});

test("the Expo Go QR code is an image named for what scanning does", async () => {
  const { container, getByRole } = render(
    <QrCode value="exp://u.expo.dev/project/--/select" label="QR code that opens Select in Expo Go" />,
  );
  expect(getByRole("img", { name: "QR code that opens Select in Expo Go" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});
