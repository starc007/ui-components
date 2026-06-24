import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Browser APIs that motion + react-use-measure touch but happy-dom omits.
// Stubbed so components mount in the test DOM without throwing.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      // Render the reduced-motion path in tests: deterministic, no JS springs
      // or scroll engines to settle, so axe sees stable markup.
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

class StubObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.ResizeObserver ??= StubObserver as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??=
  StubObserver as unknown as typeof IntersectionObserver;

if (typeof window.scrollTo !== "function") {
  window.scrollTo = () => {};
}
