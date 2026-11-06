import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CodeBlock } from "@/components/app/docs/code-block";
import { Link } from "@/i18n/navigation";
import { buildEntry } from "@/lib/registry-server";

// Already present in any React project; not worth a copy-paste install line.
const SKIP_DEPS = new Set(["react", "react-dom", "next"]);

/**
 * The shadcn-free install path: install deps, drop in the util files, copy the
 * source. Everything is derived from the same source graph the registry uses.
 */
export async function ManualInstall({
  category,
  slug,
}: {
  category: string;
  slug: string;
}) {
  const [entry, t] = await Promise.all([
    buildEntry(category, slug),
    getTranslations("Docs.install"),
  ]);
  if (!entry) return null;

  const deps = entry.dependencies.filter((dep) => !SKIP_DEPS.has(dep));
  const utilFiles = entry.files.filter((file) => file.path.startsWith("lib/"));
  const sourceFiles = entry.files.filter(
    (file) => file.type !== "preview" && !file.path.startsWith("lib/"),
  );

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

      {deps.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-foreground">
            {t("dependencies")}
          </h3>
          <div className="mt-3">
            <CodeBlock code={`npm i ${deps.join(" ")}`} lang="bash" />
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
              <CodeBlock key={file.path} code={file.content} filename={file.path} />
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
            <CodeBlock key={file.path} code={file.content} filename={file.path} />
          ))}
        </div>
      </section>
    </div>
  );
}
