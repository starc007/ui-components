import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { getNativeSetupPage, NativeSetupPage } from "../../-pages/native-setup";

export const Route = createFileRoute("/_site/docs/native-setup")({
  loader: () => getNativeSetupPage(),
  head: loaderHead,
  component: function Page() {
    return <NativeSetupPage data={Route.useLoaderData()} />;
  },
});
