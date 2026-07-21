"use client";

import { ArrowUpRight, Check } from "lucide-react";
import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "@/components/motion/center-morph-modal";

export function CenterMorphModalPreview() {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center">
      <CenterMorphModal>
        <CenterMorphModalTrigger>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Open modal
          </button>
        </CenterMorphModalTrigger>

        <CenterMorphModalContent
          ariaLabel="beUI Pro"
          ariaDescribedBy="center-morph-pro-description"
        >
          <div className="p-7 sm:p-8">
            <p className="text-sm font-medium text-muted-foreground">
              beUI Pro
            </p>
            <h2 className="mt-5 max-w-xs pr-8 text-2xl font-medium tracking-tight text-foreground">
              Ship the whole experience.
            </h2>
            <p
              id="center-morph-pro-description"
              className="mt-3 text-sm leading-relaxed text-muted-foreground"
            >
              Go beyond individual components with premium animated sections
              and complete Next.js templates.
            </p>

            <div className="mt-7 space-y-3 border-y border-border py-5">
              {[
                "Premium animated sections",
                "Complete Next.js templates",
                "Editable source and private registry",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-foreground"
                >
                  <Check
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <a
              href="https://pro.beui.dev/?utm_source=beui&utm_medium=component_preview&utm_campaign=center_morph_modal"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Explore beUI Pro
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </CenterMorphModalContent>
      </CenterMorphModal>
    </div>
  );
}
