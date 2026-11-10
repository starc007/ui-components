import {
  Link as RouterLink,
  redirect as routerRedirect,
  useLocation,
  useRouter as useTanStackRouter,
} from "@tanstack/react-router";
import { useLocale } from "use-intl";
import { type ComponentProps, forwardRef, useMemo } from "react";
import { type Locale, localizedPath, routing } from "./routing";

/**
 * Locale-aware navigation over TanStack Router, keeping the next-intl API the
 * site was written against: hrefs are English paths ("/docs/theme") and get
 * the current language prefix ("/de/docs/theme").
 */

/** Strip a non-default language prefix: "/de/docs/theme" → "/docs/theme". */
export function stripLocale(pathname: string) {
  const [, first, ...rest] = pathname.split("/");
  if (first && first !== routing.defaultLocale && (routing.locales as string[]).includes(first)) {
    return `/${rest.join("/")}`;
  }
  return pathname;
}

/** Locale-prefixed href for `href`. Hashes, queries and absolute URLs pass through. */
export function getPathname({ href, locale }: { href: string; locale: Locale }) {
  if (!href.startsWith("/")) return href;
  const match = /^([^?#]*)(.*)$/.exec(href);
  const path = match?.[1] || "/";
  return localizedPath(path, locale) + (match?.[2] ?? "");
}

type LinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  /** Kept for call sites written for next/link; TanStack preloads on intent. */
  prefetch?: boolean;
  /** Link to the same page in another language. */
  locale?: Locale;
  replace?: boolean;
  scroll?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch, locale: target, replace, scroll, ...props },
  ref,
) {
  const current = useLocale() as Locale;
  const to = getPathname({ href, locale: target ?? current });
  if (!to.startsWith("/")) return <a ref={ref} href={to} {...props} />;
  const [path, hash] = to.split("#");
  return (
    <RouterLink
      ref={ref}
      to={path}
      hash={hash}
      replace={replace}
      resetScroll={scroll}
      preload={prefetch === false ? false : "intent"}
      {...props}
    />
  );
});

/** Current path without the language prefix. */
export function usePathname() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return stripLocale(pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname);
}

export function useRouter() {
  const router = useTanStackRouter();
  const locale = useLocale() as Locale;
  return useMemo(
    () => ({
      push: (href: string) => router.navigate({ href: getPathname({ href, locale }) }),
      replace: (href: string) =>
        router.navigate({ href: getPathname({ href, locale }), replace: true }),
      prefetch: (href: string) =>
        router.preloadRoute({ to: getPathname({ href, locale }) } as Parameters<typeof router.preloadRoute>[0]),
      back: () => router.history.back(),
      refresh: () => router.invalidate(),
    }),
    [router, locale],
  );
}

/** Throw from a loader or beforeLoad to send the reader to `href` in `locale`. */
export function redirect({ href, locale }: { href: string; locale: Locale }): never {
  throw routerRedirect({ href: getPathname({ href, locale }) });
}

/** `URLSearchParams` for the current location (next/navigation's useSearchParams). */
export function useSearchParams() {
  const search = useLocation({ select: (location) => location.searchStr });
  return useMemo(() => new URLSearchParams(search), [search]);
}
