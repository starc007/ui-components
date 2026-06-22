import { THEME_CSS } from "@/lib/theme-css";

export const dynamic = "force-static";

export function GET() {
  return new Response(THEME_CSS, {
    headers: {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}
