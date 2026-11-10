/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import globalsCss from "../styles/globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#fcfcfc" },
      { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#151515" },
      { name: "application-name", content: "beUI" },
      { name: "format-detection", content: "telephone=no, email=no, address=no" },
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      { rel: "icon", type: "image/png", href: "/beui-mark.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "alternate", type: "text/plain", title: "llms.txt", href: "/llms.txt" },
      { rel: "alternate", type: "application/json", title: "Component registry", href: "/r" },
      { rel: "alternate", type: "application/json", title: "shadcn registry", href: "/registry.json" },
    ],
    scripts: import.meta.env.PROD
      ? [
          {
            defer: true,
            src: "https://collect.tracwell.app/script.js",
            "data-project-key": "tw_live_b83ebcb2a50b4e3b82f65ca32c086623",
            "data-collection-mode": "product",
            "data-consent": "granted",
            "data-respect-do-not-track": "true",
          },
        ]
      : [],
  }),
  shellComponent: RootDocument,
  component: Outlet,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
