import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { getNativeIndexPage, NativeIndexPage } from "../../-pages/native-pages";

export const Route = createFileRoute("/_site/react-native/")({
  loader: () => getNativeIndexPage(),
  head: loaderHead,
  component: function Page() {
    return <NativeIndexPage data={Route.useLoaderData()} />;
  },
});
