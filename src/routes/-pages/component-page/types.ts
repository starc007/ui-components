import type { HighlightedCode } from "@/lib/highlight";
import type { ManualInstallData } from "@/lib/manual-install";
import type { ComponentPropsDoc } from "@/lib/props-extractor";
import type { ComponentCredit, ComponentExample } from "@/lib/registry";

export type ComponentPageInput = { category: string; slug: string };

export type ExampleData = {
  example: ComponentExample;
  source: HighlightedCode;
  usage: HighlightedCode;
  propsDocs: ComponentPropsDoc[];
  manual: ManualInstallData | null;
};

export type CreditGroup = { credit: ComponentCredit; examples: ComponentExample[] };

export type VariantCardData = {
  slug: string;
  name: string;
  previewKey: string;
  href: string;
  badge: "new" | null;
  launchedAt: string | null;
};
