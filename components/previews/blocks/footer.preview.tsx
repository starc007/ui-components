"use client";

import { Footer } from "@/components/blocks/footer";

export function FooterPreview() {
  return (
    <Footer
      columns={[
        { title: "Product", links: [{ label: "Components", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }] },
        { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Contact", href: "#" }] },
        { title: "Legal", links: [{ label: "Terms", href: "#" }, { label: "Privacy", href: "#" }] },
      ]}
    />
  );
}
