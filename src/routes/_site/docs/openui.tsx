import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { getOpenUIPage, OpenUIPage } from "../../-pages/openui";

export const Route = createFileRoute("/_site/docs/openui")({
  loader: () => getOpenUIPage(),
  head: loaderHead,
  component: function Page() {
    return <OpenUIPage data={Route.useLoaderData()} />;
  },
});
