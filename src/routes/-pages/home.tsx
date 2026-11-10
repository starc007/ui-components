import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import type { NativePhone } from "@/components/app/landing/native-phones";
import { nativeComponentPath } from "@/lib/component-paths";
import { native } from "@/lib/native";

/** Native components whose clips show the most in a few seconds. */
const FEATURED_NATIVE = ["tabs", "color-picker", "alert", "swipeable-list"];

// The native catalog holds every file's source, so it is read here at build
// time and only the clips reach the page.
export const getHomePage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const phones: NativePhone[] = FEATURED_NATIVE.flatMap((slug) => {
      const component = native.components.find((c) => c.slug === slug);
      return component
        ? [{ slug, title: component.title, href: nativeComponentPath(slug), clips: component.clips }]
        : [];
    });
    return { phones };
  });
