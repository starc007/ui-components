import type { ReactNode } from "react";

export function GuideShell({ children }: { children: ReactNode }) {
  return <article className="min-w-0">{children}</article>;
}
