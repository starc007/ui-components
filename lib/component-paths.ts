/** Public documentation routes; charts have their own top-level section. */
export function categoryPath(category: string) {
  return category === "charts" ? "/charts" : `/components/${category}`;
}

export function componentPath(category: string, slug: string) {
  return `${categoryPath(category)}/${slug}`;
}

/** Pages whose catalog navigation is visible from the md breakpoint. */
export function hasSiteSidebar(pathname: string) {
  return ["/components", "/docs", "/charts"].some((path) => pathname.startsWith(path));
}
