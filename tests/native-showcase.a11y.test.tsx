import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { NativeUnavailable } from "@/components/app/docs/native/native-unavailable";
import { PlatformTabs } from "@/components/app/docs/native/platform-tabs";
import { QrCode } from "@/components/app/docs/native/qr-code";

afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.platform;
  window.history.replaceState(null, "", "/");
});

function Platforms() {
  return (
    <PlatformTabs
      web={<a href="#web-usage">Web usage</a>}
      native={<a href="#native-install">Native install</a>}
    />
  );
}

test("platform tabs are a labelled tablist that switches the page's platform", async () => {
  const { container, getByRole } = render(<Platforms />);
  expect(getByRole("tablist", { name: "Platform" })).toBeTruthy();
  expect(getByRole("tab", { name: "Web" }).getAttribute("aria-selected")).toBe("true");
  expect(document.documentElement.dataset.platform).toBeUndefined();
  expect((await axe(container)).violations).toEqual([]);

  const nativeTab = getByRole("tab", { name: "React Native" });
  await act(async () => {
    fireEvent.click(nativeTab);
  });
  // CSS shows the native panel from this attribute.
  expect(nativeTab.getAttribute("aria-selected")).toBe("true");
  expect(document.documentElement.dataset.platform).toBe("native");
  expect(localStorage.getItem("beui:platform")).toBe("native");
  expect(window.location.search).toBe("?platform=native");
  expect((await axe(container)).violations).toEqual([]);
});

test("the platform set before paint selects its tab", async () => {
  // The inline script sets this from the remembered choice before hydration.
  document.documentElement.dataset.platform = "native";
  const { getByRole } = render(<Platforms />);
  expect(
    getByRole("tab", { name: "React Native" }).getAttribute("aria-selected"),
  ).toBe("true");
});

test("the Expo Go QR code is an image named for what scanning does", async () => {
  const { container, getByRole } = render(
    <QrCode value="exp://u.expo.dev/project/--/select" label="QR code that opens Select in Expo Go" />,
  );
  expect(getByRole("img", { name: "QR code that opens Select in Expo Go" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("a web-only component's native tab offers a way back to the web docs", async () => {
  document.documentElement.dataset.platform = "native";
  const { container, getByRole } = render(
    <NativeUnavailable
      title="Marquee isn't on React Native yet"
      description="This one is web only for now."
    />,
  );
  expect(getByRole("heading", { name: "Marquee isn't on React Native yet" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
  await act(async () => {
    fireEvent.click(getByRole("button", { name: "Show the web version" }));
  });
  expect(document.documentElement.dataset.platform).toBeUndefined();
  expect(localStorage.getItem("beui:platform")).toBe("web");
});
