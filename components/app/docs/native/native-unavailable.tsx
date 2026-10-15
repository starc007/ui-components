"use client";

import { Smartphone } from "lucide-react";
import { choosePlatform } from "@/components/app/docs/native/platform-switch";

/** The React Native view of something that has no native version yet. */
export function NativeUnavailable({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section
      id="native-preview"
      className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border px-6 py-10"
    >
      <Smartphone aria-hidden="true" className="size-5 text-muted-foreground" />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      <button
        type="button"
        onClick={() => choosePlatform("web")}
        className="mt-1 text-sm font-medium text-foreground underline underline-offset-4"
      >
        Show the web version
      </button>
    </section>
  );
}
