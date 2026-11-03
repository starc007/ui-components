import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotFoundGlitch } from "@/components/motion/not-found/glitch";

// not-found gets no params; the locale comes from the request.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Chrome.notFound");
  return { title: t("title"), description: t("description") };
}

export default function NotFound() {
  return <NotFoundGlitch />;
}
