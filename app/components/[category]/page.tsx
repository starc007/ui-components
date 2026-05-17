import { notFound } from "next/navigation";
import Link from "next/link";
import { findCategory, registry } from "@/lib/registry";
import { Breadcrumb } from "@/components/data-nav/breadcrumb";
import { getPreview } from "@/components/previews";

export function generateStaticParams() {
  return registry.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Components", href: "/components" },
          { label: cat.name },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-(--color-fg)">{cat.name}</h1>
      <p className="mt-2 max-w-2xl text-(--color-fg-muted)">{cat.description}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {cat.components.map((comp) => {
          const Preview = getPreview(cat.slug, comp.slug);
          return (
            <Link
              key={comp.slug}
              href={`/components/${cat.slug}/${comp.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elev) transition-colors hover:border-(--color-border-strong)"
            >
              <div className="relative flex h-56 items-center justify-center overflow-hidden border-b border-(--color-border) bg-(--color-bg) p-6 mask-b-fade">
                <div className="pointer-events-none scale-90 [&_*]:!cursor-default">
                  {Preview ? <Preview /> : null}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-(--color-fg)">{comp.name}</h3>
                <p className="mt-1 text-sm text-(--color-fg-muted)">{comp.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
