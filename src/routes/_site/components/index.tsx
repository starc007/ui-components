import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@/lib/navigation";

export const Route = createFileRoute("/_site/components/")({
  beforeLoad: () => {
    redirect("/components/motion");
  },
});
