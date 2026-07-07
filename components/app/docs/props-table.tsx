import type { ComponentPropsDoc } from "@/lib/props-extractor";

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
          <div className="divide-y divide-border rounded-xl border border-border">
            {doc.props.map((prop) => (
              <div
                key={prop.name}
                className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[140px_minmax(0,1fr)_100px] sm:gap-4"
              >
                <code className="h-fit w-fit rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
                  {prop.name}
                  {prop.required ? "" : "?"}
                </code>
                <div className="min-w-0">
                  <code className="w-fit rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {prop.type}
                  </code>
                  {prop.description ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {prop.description}
                    </p>
                  ) : null}
                </div>
                <code className="h-fit w-fit rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-muted-foreground sm:justify-self-end">
                  {prop.defaultValue ?? "—"}
                </code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
