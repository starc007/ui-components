import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { findCategory, registry, type ComponentEntry } from "@/lib/registry";
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();
  const newComponents = cat.components.filter((comp) => comp.badge === "new");
  const components = cat.components.filter((comp) => comp.badge !== "new");

  return (
    <div>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <span className="font-medium text-(--color-fg)">{cat.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-(--color-fg)">
        {cat.name}
      </h1>
      <p className="mt-2 max-w-2xl text-(--color-fg-muted)">
        {cat.description}
      </p>

      {newComponents.length ? (
        <section className="mt-10">
          <p className="font-pixel text-xs font-medium uppercase text-(--color-fg-muted)">
            New
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {newComponents.map((comp) => (
              <CategoryComponentCard
                key={comp.slug}
                categorySlug={cat.slug}
                component={comp}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <p className="font-pixel text-xs font-medium uppercase text-(--color-fg-muted)">
          All {cat.name}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {components.map((comp) => (
            <CategoryComponentCard
              key={comp.slug}
              categorySlug={cat.slug}
              component={comp}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryComponentCard({
  categorySlug,
  component,
}: {
  categorySlug: string;
  component: ComponentEntry;
}) {
  return (
    <Link
      href={`/components/${categorySlug}/${component.slug}`}
      className="group/card relative flex h-40 flex-col overflow-hidden rounded-3xl bg-(--color-bg-elev) transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] contain-[paint] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <h3 className="truncate font-pixel text-base font-medium text-(--color-fg)">
          {component.name}
        </h3>
        {component.badge === "new" ? <NewBadge /> : null}
      </div>

      <div className="mx-2 mb-2 flex min-h-0 flex-1 items-start overflow-hidden rounded-3xl bg-(--color-bg) px-4 py-4 transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:bg-(--color-bg)/80 group-focus-visible/card:bg-(--color-bg)/80">
        <p className="line-clamp-3 text-sm leading-relaxed text-(--color-fg-muted)">
          {component.description}
        </p>
      </div>
    </Link>
  );
}
