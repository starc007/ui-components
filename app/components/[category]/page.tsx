import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { findCategory, registry } from "@/lib/registry";
import { getPreview } from "@/components/previews";

export function generateStaticParams() {
  return registry.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) return {};

  const title = `${cat.name} components · beUI v2`;
  const pageUrl = `/components/${cat.slug}`;
  const imageUrl = `/api/og?category=${cat.slug}`;
  const componentNames = cat.components.map((comp) => comp.name);

  return {
    title,
    description: cat.description,
    keywords: [
      `${cat.name} components`,
      "React motion components",
      "Tailwind CSS components",
      "shadcn-compatible components",
      "shadcn registry",
      "beUI v2",
      ...componentNames,
    ],
    openGraph: {
      title,
      description: cat.description,
      url: pageUrl,
      type: "website",
      siteName: "beUI v2",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${cat.name} components by beUI v2`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cat.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
      types: {
        "application/json": "/registry.json",
      },
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();

  return (
    <div>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-(--color-fg)">{cat.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-(--color-fg)">{cat.name}</h1>
      <p className="mt-2 max-w-2xl text-(--color-fg-muted)">{cat.description}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {cat.components.map((comp) => {
          const Preview = getPreview(cat.slug, comp.slug);
          return (
            <Link
              key={comp.slug}
              href={`/components/${cat.slug}/${comp.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-bg-elev) transition-colors hover:border-(--color-border-strong)"
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
