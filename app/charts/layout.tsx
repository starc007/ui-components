import type { ReactNode } from "react";

export default function ChartsLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 py-10">{children}</div>;
}
