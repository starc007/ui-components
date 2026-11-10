import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { CodeBlock } from "@/components/app/docs/code-block";
import { Link } from "@/lib/navigation";
import type { ManualInstallData } from "@/lib/manual-install";

/**
 * The shadcn-free install path: install deps, drop in the util files, copy the
 * source. The page's loader builds `data` with `buildManualInstall`.
 */
export function ManualInstall({ data }: { data: ManualInstallData }) {
  const t = useTranslations("Docs.install");
  const { dependencies, utilFiles, sourceFiles } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-card px-5 py-4 text-sm text-muted-foreground">
        {t.rich("themeNotice", {
          code: (chunks) => (
            <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
              {chunks}
            </code>
          ),
          link: (chunks) => (
            <Link
              href="/docs/theme"
              className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
            >
              {chunks}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          ),
        })}
      </div>

      {dependencies ? (
        <section>
          <h3 className="text-sm font-semibold text-foreground">
            {t("dependencies")}
          </h3>
          <div className="mt-3">
            <CodeBlock {...dependencies} />
          </div>
        </section>
      ) : null}

      {utilFiles.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-foreground">
            {t("utilFiles", { count: utilFiles.length })}
          </h3>
          <div className="mt-3 flex flex-col gap-4">
            {utilFiles.map((file) => (
              <CodeBlock key={file.filename} {...file} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="text-sm font-semibold text-foreground">
          {t("sourceCode")}
        </h3>
        <div className="mt-3 flex flex-col gap-4">
          {sourceFiles.map((file) => (
            <CodeBlock key={file.filename} {...file} />
          ))}
        </div>
      </section>
    </div>
  );
}
