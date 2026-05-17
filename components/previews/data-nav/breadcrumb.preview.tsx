"use client";

import { Breadcrumb } from "@/components/data-nav/breadcrumb";

export function BreadcrumbPreview() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Components", href: "/components" },
        { label: "Data & Nav", href: "/components/data-nav" },
        { label: "Breadcrumb" },
      ]}
    />
  );
}
