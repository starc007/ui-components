import { useTranslations } from "use-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

const FAQ_IDS = [
  "free",
  "install",
  "stack",
  "reactNative",
  "customize",
  "pro",
] as const;

const linkClass = "underline underline-offset-4";

const code = (chunks: ReactNode) => (
  <code className="rounded bg-muted px-1 py-0.5 text-xs [overflow-wrap:anywhere]">{chunks}</code>
);

/** The landing FAQ as accordion items, in the page's language. */
export function useFaqItems() {
  const t = useTranslations("Landing.faq");
  const answers: Record<(typeof FAQ_IDS)[number], ReactNode> = {
    free: t.rich("free.answer", {
      link: (chunks) => (
        <a
          className={linkClass}
          href="https://github.com/starc007/ui-components/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer noopener"
        >
          {chunks}
        </a>
      ),
    }),
    install: t.rich("install.answer", {
      command: "bunx --bun shadcn add @beui/button",
      code,
    }),
    stack: t.rich("stack.answer", {
      link: (chunks) => (
        <Link className={linkClass} href="/docs/theme">
          {chunks}
        </Link>
      ),
    }),
    reactNative: t.rich("reactNative.answer", {
      command: "npx beui-native add button",
      code,
      setup: (chunks) => (
        <Link className={linkClass} href="/docs/native-setup">
          {chunks}
        </Link>
      ),
      components: (chunks) => (
        <Link className={linkClass} href="/react-native">
          {chunks}
        </Link>
      ),
    }),
    customize: t("customize.answer"),
    pro: t("pro.answer"),
  };
  return FAQ_IDS.map((id) => ({
    id,
    title: t(`${id}.question`),
    description: answers[id],
  }));
}
