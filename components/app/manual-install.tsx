import { CodeBlock } from "@/components/app/code-block";
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
