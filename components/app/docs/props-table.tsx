import type { ComponentPropsDoc } from "@/lib/props-extractor";

const COLUMNS = "sm:grid-cols-[140px_minmax(160px,0.75fr)_minmax(240px,2fr)]";

export function PropsTable({ docs }: { docs: ComponentPropsDoc[] }) {
  const withProps = docs.filter((doc) => doc.props.length > 0);
  if (!withProps.length) return null;

  return (
    <div className="flex flex-col gap-8">
      {withProps.map((doc) => (
        <div key={doc.displayName}>
          {withProps.length > 1 ? (
            <h3 className="mb-3 font-mono text-sm font-semibold text-foreground">
              {doc.displayName}
            </h3>
          ) : null}
          <div className="rounded-3xl bg-card p-2 sm:pt-0">
            <div
              aria-hidden="true"
              className={`hidden gap-4 px-6 py-3 text-xs font-medium text-muted-foreground sm:grid ${COLUMNS}`}
            >
              <span>Prop</span>
              <span>Type</span>
              <span className="justify-self-end">Default</span>
            </div>
            <div className="divide-y divide-border rounded-3xl bg-background">
            {doc.props.map((prop) => (
              <div
                key={prop.name}
                className={`grid grid-cols-1 gap-2 px-4 py-3 sm:gap-4 ${COLUMNS}`}
              >
                <code className="h-fit w-fit rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
                  {prop.name}
                  {prop.required ? "" : "?"}
                </code>
                <div className="min-w-0">
                  <code className="w-fit wrap-anywhere rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
                    {prop.type}
                  </code>
                  {prop.description ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {prop.description}
                    </p>
                  ) : null}
                </div>
                {/* Give verbose defaults the widest track and let them wrap
                    without pushing into the type column. */}
                <div className="flex min-w-0 items-baseline gap-2 sm:justify-self-end">
                  <span className="text-xs text-muted-foreground sm:sr-only">Default</span>
                  <code className="h-fit w-fit min-w-0 wrap-anywhere rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
                    {prop.defaultValue ?? "—"}
                  </code>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
