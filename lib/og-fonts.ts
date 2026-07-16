const FONT_FILES = {
  regular: "/og/fonts/Geist-Regular.ttf",
  medium: "/og/fonts/Geist-Medium.ttf",
  mono: "/og/fonts/GeistMono-Medium.ttf",
} as const;

const cache = new Map<string, ReturnType<typeof createFonts>>();

function loadFont(origin: string, path: string) {
  return fetch(new URL(path, origin)).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load OG font ${path}: ${response.status}`);
    }
    return response.arrayBuffer();
  });
}

async function createFonts(origin: string) {
  const [regular, medium, mono] = await Promise.all([
    loadFont(origin, FONT_FILES.regular),
    loadFont(origin, FONT_FILES.medium),
    loadFont(origin, FONT_FILES.mono),
  ]);

  return [
    { name: "Geist", data: regular, weight: 400 as const },
    { name: "Geist", data: medium, weight: 500 as const },
    { name: "Geist Mono", data: mono, weight: 500 as const },
  ];
}

export function getOgFonts(origin: string) {
  const cached = cache.get(origin);
  if (cached) return cached;

  const fonts = createFonts(origin);
  cache.set(origin, fonts);
  return fonts;
}
