/** Public documentation routes; charts have their own top-level section. */
export function categoryPath(category: string) {
  return category === "charts" ? "/charts" : `/components/${category}`;
}

export function componentPath(category: string, slug: string) {
  return `${categoryPath(category)}/${slug}`;
}
