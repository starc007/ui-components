import Link from "next/link";
import type { AgentGuide } from "@/lib/agent-guides";

function lowercaseFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function ComponentGuide({
  guide,
  className,
}: {
  guide: AgentGuide;
  className?: string;
}) {
  return (
    <div className={className}>
      <section
        id="composition"
        className="mt-12 scroll-mt-24 border-t border-border pt-8"
      >
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Composition
        </h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {guide.composition.description}
        </p>
        <pre className="mt-4 w-full overflow-x-auto rounded-xl bg-muted p-5 font-mono text-[13px] leading-6 text-foreground">
          <code>{guide.composition.tree}</code>
        </pre>
        {guide.connections.length ? (
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span>{" "}
            {guide.connections.map((connection, index) => (
              <span key={connection.slug}>
                {index > 0 ? " " : null}
                <Link
                  href={`/components/agents/${connection.slug}`}
                  className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {connection.name}
                </Link>{" "}
                {lowercaseFirst(connection.description)}
              </span>
            ))}
          </p>
        ) : null}
      </section>

      <section
        id="behavior"
        className="mt-12 scroll-mt-24 border-t border-border pt-8"
      >
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          How it works
        </h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {guide.introduction}
        </p>
      </section>
    </div>
  );
}
