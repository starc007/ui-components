import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { findCategory, registry } from "@/lib/registry";
import { NewBadge } from "@/components/app/new-badge";

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

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cat.components.map((comp) => (
          <Link
            key={comp.slug}
            href={`/components/${cat.slug}/${comp.slug}`}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-bg-elev) px-4 py-3.5 transition-colors hover:border-(--color-border-strong)"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-(--color-fg)">
                  {comp.name}
                </h3>
                {comp.badge === "new" ? <NewBadge /> : null}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-(--color-fg-muted)">{comp.description}</p>
            </div>
            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
