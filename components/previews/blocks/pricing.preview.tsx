"use client";

import { Pricing } from "@/components/blocks/pricing";

export function PricingPreview() {
  return (
    <Pricing
      title="Simple pricing"
      description="Pay only for what you need."
      tiers={[
        {
          name: "Hobby",
          price: "$0",
          period: "mo",
          description: "For tinkering on side projects.",
          features: ["1 project", "Community support", "Basic analytics"],
          cta: { label: "Start free", href: "#" },
        },
        {
          name: "Pro",
          price: "$19",
          period: "mo",
          description: "For shipping production apps.",
          features: ["Unlimited projects", "Priority support", "Advanced analytics", "Custom domains"],
          cta: { label: "Upgrade", href: "#" },
          highlighted: true,
        },
        {
          name: "Team",
          price: "$49",
          period: "mo",
          description: "For collaborative teams.",
          features: ["Everything in Pro", "Roles & permissions", "Audit logs", "SSO / SAML"],
          cta: { label: "Contact sales", href: "#" },
        },
      ]}
    />
  );
}
