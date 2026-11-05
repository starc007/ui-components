/** Categories with their own top-level section instead of /components/<category>. */
export const TOP_LEVEL_CATEGORIES = ["charts", "casino"];

/** Public documentation routes. */
export function categoryPath(category: string) {
  return TOP_LEVEL_CATEGORIES.includes(category) ? `/${category}` : `/components/${category}`;
}

export function componentPath(category: string, slug: string) {
  return `${categoryPath(category)}/${slug}`;
}

/** beUI Native's index and component pages. */
export const NATIVE_PATH = "/react-native";

export function nativeComponentPath(slug: string) {
  return `${NATIVE_PATH}/${slug}`;
}

export function isNativePath(pathname: string) {
  return pathname === NATIVE_PATH || pathname.startsWith(`${NATIVE_PATH}/`);
}

/** Pages whose catalog navigation is visible from the md breakpoint. */
export function hasSiteSidebar(pathname: string) {
  return (
    ["/components", "/docs", "/charts", "/casino", "/guides", "/alternatives"].some((path) =>
      pathname.startsWith(path),
    ) ||
    isNativePath(pathname)
  );
}

/** Component, category and React Native pages, which offer the Web/React Native switch. */
export function hasPlatformSwitch(pathname: string) {
  return /^\/components\/[^/]+(\/[^/]+)?\/?$/.test(pathname) || isNativePath(pathname);
}
