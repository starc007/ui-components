import { useTranslations } from "use-intl";
import { NotFoundGlitch } from "@/components/motion/not-found/glitch";

/** Head tags for a not-found page: its title, description and noindex. */
export function notFoundMeta(text: { title: string; description: string } | undefined) {
  return [
    ...(text
      ? [{ title: `${text.title} · beUI` }, { name: "description", content: text.description }]
      : []),
    { name: "robots", content: "noindex" },
  ];
}

/** The 404 page. Its title and noindex come from the site layout's head. */
export function NotFoundPage() {
  const t = useTranslations("Chrome.notFound");
  return (
    <NotFoundGlitch
      title={t("title")}
      description={t("description")}
      homeHref="/"
      homeLabel={t("homeLabel")}
      browseHref="/components/motion"
      browseLabel={t("browseLabel")}
    />
  );
}
