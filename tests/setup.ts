import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Browser APIs that motion + react-use-measure touch but happy-dom omits.
// Stubbed so components mount in the test DOM without throwing.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
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
