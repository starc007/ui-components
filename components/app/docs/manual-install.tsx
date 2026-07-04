import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/app/docs/code-block";
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
  const entry = await buildEntry(category, slug);
  if (!entry) return null;

  const deps = entry.dependencies.filter((dep) => !SKIP_DEPS.has(dep));
  const utilFiles = entry.files.filter((file) => file.path.startsWith("lib/"));
  const sourceFiles = entry.files.filter(
    (file) => file.type !== "preview" && !file.path.startsWith("lib/"),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Needs the theme tokens once. Already ran{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          shadcn init
        </code>
        ? You are set.{" "}
        <Link
          href="/docs/theme"
          className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
        >
          Theme setup
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {deps.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-foreground">
            Install dependencies
          </h3>
          <div className="mt-3">
            <CodeBlock code={`npm i ${deps.join(" ")}`} lang="bash" />
          </div>
        </section>
      ) : null}

      {utilFiles.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-foreground">
            Add util file{utilFiles.length > 1 ? "s" : ""}
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
          Copy the source code
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
