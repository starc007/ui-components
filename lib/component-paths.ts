/** Categories with their own top-level section instead of /components/<category>. */
export const TOP_LEVEL_CATEGORIES = ["charts", "casino"];

/** The top-level section a path is in, if any. */
export function topLevelCategory(pathname: string) {
  return TOP_LEVEL_CATEGORIES.find((slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`));
}

export function isTopLevelPath(pathname: string) {
  return topLevelCategory(pathname) !== undefined;
}

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
    ["/components", "/docs", "/guides", "/alternatives"].some((path) => pathname.startsWith(path)) ||
    isTopLevelPath(pathname) ||
    isNativePath(pathname)
  );
}

/** Component, category and React Native pages, which offer the Web/React Native switch. */
export function hasPlatformSwitch(pathname: string) {
  return /^\/components\/[^/]+(\/[^/]+)?\/?$/.test(pathname) || isNativePath(pathname);
}
