import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { getThemePage, ThemePage } from "../../-pages/theme";

export const Route = createFileRoute("/_site/docs/theme")({
  loader: () => getThemePage(),
  head: loaderHead,
  component: function Page() {
    return <ThemePage data={Route.useLoaderData()} />;
  },
});
