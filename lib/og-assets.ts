import type { OgVariant } from "@/lib/og";

export function getOgAssets(variant: OgVariant, origin: string) {
  return {
    logoSrc: new URL("/beui-mark.png", origin).toString(),
    backgroundSrc: new URL(
      `/og/grainient-${variant}.jpg`,
      origin,
    ).toString(),
  };
}
