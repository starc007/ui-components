import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { NumberTicker } from "@/components/motion/number-ticker";
import { MultiChainSwap } from "@/components/motion/swap";
import { WalletCard } from "@/components/motion/wallet-card";
import { TablePreview } from "@/components/previews/motion/table.preview";

const VALUE = 1234567;
const EN_US = "1,234,567";
const DE_DE = "1.234.567";

/**
 * Run `body` as if the runtime's default locale were `tag`.
 *
 * The runner cannot be pushed off en-US from the outside: Bun resolves the
 * default ICU locale from the host, and `LANG=de_DE.UTF-8 bun test` still
 * reports `Intl.DateTimeFormat().resolvedOptions().locale === "en-US"`.
 * Replacing the global `Intl.NumberFormat` does not help either, because
 * `Number.prototype.toLocaleString` is native and never reads it. So the
 * substitution happens on `toLocaleString` itself: a call that omits a locale
 * — exactly the call whose result a de-DE browser and an en-US server
 * disagree on — is redirected to `tag`, while a call that names a locale is
 * passed through untouched.
 */
async function withDefaultLocale<T>(
  tag: string,
  body: () => T | Promise<T>,
): Promise<T> {
  const original = Number.prototype.toLocaleString;
  Number.prototype.toLocaleString = function patched(
    this: number,
    locales?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions,
  ) {
    return original.call(this, locales ?? tag, options);
  };
  try {
    return await body();
  } finally {
    Number.prototype.toLocaleString = original;
  }
}

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const mountedContainers: HTMLDivElement[] = [];

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
  });
  for (const container of mountedContainers.splice(0)) container.remove();
});

/**
 * Server-render `element` on an en-US server, then hydrate it in a de-DE
 * browser. Returns the recoverable errors React reported: a text mismatch
 * makes React discard the server markup and report one.
 */
async function hydrateInGerman(element: ReactElement) {
  const container = document.createElement("div");
  container.innerHTML = await withDefaultLocale("en-US", () =>
    renderToString(element),
  );
  document.body.appendChild(container);
  mountedContainers.push(container);

  const recoverableErrors: unknown[] = [];
  await withDefaultLocale("de-DE", () =>
    act(async () => {
      const root = hydrateRoot(container, element, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
      mountedRoots.push(root);
    }),
  );
  return { container, recoverableErrors };
}

describe("hydration across server and browser locales", () => {
  test("the harness catches a locale-less format", async () => {
    // Guards every test below: if the harness stopped seeing the mismatch,
    // they would pass without proving anything. The format has to run during
    // render, inside each side's locale, as a component's does.
    function RuntimeLocale() {
      return <span>{VALUE.toLocaleString()}</span>;
    }
    const { recoverableErrors } = await hydrateInGerman(<RuntimeLocale />);
    expect(recoverableErrors.length).toBeGreaterThan(0);
  });

  test("NumberTicker with locale groups in en-US on both sides", async () => {
    const { container, recoverableErrors } = await hydrateInGerman(
      <NumberTicker value={VALUE} locale startOnView={false} />,
    );
    expect(recoverableErrors).toEqual([]);
    // The digits render as roll columns; the formatted string is readable
    // as text only through the screen-reader copy.
    expect(container.querySelector(".sr-only")?.textContent).toBe(EN_US);
  });

  test("NumberTicker without locale still omits separators", async () => {
    const { container, recoverableErrors } = await hydrateInGerman(
      <NumberTicker value={VALUE} startOnView={false} />,
    );
    expect(recoverableErrors).toEqual([]);
    expect(container.querySelector(".sr-only")?.textContent).toBe("1234567");
  });

  test("AnimatedNumber needs no pinned locale: its server markup is 0", async () => {
    const { recoverableErrors } = await hydrateInGerman(
      <AnimatedNumber value={VALUE} startOnView={false} />,
    );
    expect(recoverableErrors).toEqual([]);
  });

  test("WalletCard", async () => {
    const accounts = [{ id: "main", name: "Main", address: "0x8f3C" }];
    const { container, recoverableErrors } = await hydrateInGerman(
      <WalletCard accounts={accounts} balance={12480.32} defaultChange={124.5} />,
    );
    expect(recoverableErrors).toEqual([]);
    expect(container.textContent).toContain("12,480.32");
  });

  test("WalletCard honours an explicit locale", async () => {
    const accounts = [{ id: "main", name: "Main", address: "0x8f3C" }];
    const { container, recoverableErrors } = await hydrateInGerman(
      <WalletCard accounts={accounts} balance={12480.32} locale="de-DE" />,
    );
    expect(recoverableErrors).toEqual([]);
    expect(container.textContent).toContain("12.480,32");
  });

  test("MultiChainSwap", async () => {
    const { recoverableErrors } = await hydrateInGerman(<MultiChainSwap />);
    expect(recoverableErrors).toEqual([]);
  });

  test("MultiChainSwap honours an explicit locale", async () => {
    const { container, recoverableErrors } = await hydrateInGerman(
      <MultiChainSwap locale="de-DE" />,
    );
    expect(recoverableErrors).toEqual([]);
    // The received amount is fractional, so its decimal separator shows the
    // locale.
    expect(container.textContent).toMatch(/You get\d+,\d+/);
  });

  test("table preview", async () => {
    const { recoverableErrors } = await hydrateInGerman(<TablePreview />);
    expect(recoverableErrors).toEqual([]);
  });
});
