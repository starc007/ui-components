import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router";
import type { ReactElement } from "react";
import { IntlProvider } from "use-intl";
import { englishMessages } from "@/i18n/messages";

// Site components link and read the location through TanStack Router. One
// loaded router at "/" gives them that context without rendering routes.
const router = createRouter({
  routeTree: createRootRoute(),
  history: createMemoryHistory({ initialEntries: ["/"] }),
});
await router.load();

/** Site components read their copy from use-intl; render them with English. */
export function withIntl(ui: ReactElement) {
  return (
    <RouterContextProvider router={router}>
      <IntlProvider locale="en" messages={englishMessages} timeZone="UTC">
        {ui}
      </IntlProvider>
    </RouterContextProvider>
  );
}
