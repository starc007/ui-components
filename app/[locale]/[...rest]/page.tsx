import { notFound } from "next/navigation";

// Unmatched paths land here so app/[locale]/not-found.tsx renders inside the
// localized layout instead of Next's bare 404.
export default function CatchAll() {
  notFound();
}
