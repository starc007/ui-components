import {
  Link as RouterLink,
  redirect as routerRedirect,
  useLocation,
  useRouter as useTanStackRouter,
} from "@tanstack/react-router";
import { type ComponentProps, forwardRef, useMemo } from "react";

/**
 * Site navigation over TanStack Router with the small next/link-style API the
 * site uses: `<Link href>`, `usePathname`, `useRouter().push`. Hashes and
 * queries pass through; absolute URLs render a plain anchor.
 */

type LinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  /** false turns off preloading on hover; it is on by default. */
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch, replace, scroll, ...props },
  ref,
) {
  if (!href.startsWith("/")) return <a ref={ref} href={href} {...props} />;
  const [path, hash] = href.split("#");
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

/** Current path, without a trailing slash. */
export function usePathname() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
}

export function useRouter() {
  const router = useTanStackRouter();
  return useMemo(
    () => ({
      push: (href: string) => router.navigate({ href }),
      replace: (href: string) => router.navigate({ href, replace: true }),
      prefetch: (href: string) =>
        router.preloadRoute({ to: href } as Parameters<typeof router.preloadRoute>[0]),
      back: () => router.history.back(),
      refresh: () => router.invalidate(),
    }),
    [router],
  );
}

/** Throw from a loader or beforeLoad to send the reader to `href`. */
export function redirect(href: string): never {
  throw routerRedirect({ href });
}

/** `URLSearchParams` for the current location. */
export function useSearchParams() {
  const search = useLocation({ select: (location) => location.searchStr });
  return useMemo(() => new URLSearchParams(search), [search]);
}
