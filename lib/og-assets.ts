export function getOgAssets(origin: string) {
  return {
    logoSrc: new URL("/beui-mark.png", origin).toString(),
    backgroundSrc: new URL("/og/dither-wave.png", origin).toString(),
  };
}
