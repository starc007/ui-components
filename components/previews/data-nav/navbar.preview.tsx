"use client";

import { Navbar } from "@/components/data-nav/navbar";

export function NavbarPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--color-border)">
      <Navbar
        brand="Acme"
        links={[
          { label: "Product", href: "#" },
          { label: "Pricing", href: "#" },
          { label: "Docs", href: "#" },
          { label: "Blog", href: "#" },
        ]}
        cta={{ label: "Sign in", href: "#" }}
      />
      <div className="p-12 text-center text-sm text-(--color-fg-muted)">Page content…</div>
    </div>
  );
}
