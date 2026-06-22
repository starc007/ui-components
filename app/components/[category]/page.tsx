import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findCategory, registry } from "@/lib/registry";
import { ComponentCard } from "@/components/app/component-card";
import { JsonLd } from "@/components/app/json-ld";
import { breadcrumbJsonLd, categoryJsonLd } from "@/lib/seo";

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

  const title = `${cat.name} · React motion components`;
  const ogTitle = `${title} · beUI`;
  const pageUrl = `/components/${cat.slug}`;
  const imageUrl = `/api/og?category=${cat.slug}`;
  const componentNames = cat.components.map((comp) => comp.name);

  return {
    title,
    description: cat.description,
    keywords: [
      `${cat.name} components`,
      "React motion components",
      "best motion components",
      "free motion components",
      "open source motion components",
      "Tailwind CSS components",
      "shadcn-compatible components",
      "shadcn registry",
      "beUI",
      ...componentNames,
    ],
    openGraph: {
      title: ogTitle,
      description: cat.description,
      url: pageUrl,
      type: "website",
      siteName: "beUI",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${cat.name} components by beUI`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
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
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "beUI", path: "/" },
            { name: cat.name, path: `/components/${cat.slug}` },
          ]),
          categoryJsonLd(cat),
        ]}
      />
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
              <ComponentCard
                key={comp.slug}
                categorySlug={cat.slug}
                slug={comp.slug}
                name={comp.name}
                description={comp.description}
                badge={comp.badge}
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
            <ComponentCard
              key={comp.slug}
              categorySlug={cat.slug}
              slug={comp.slug}
              name={comp.name}
              description={comp.description}
              badge={comp.badge}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
