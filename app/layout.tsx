import type { ReactNode } from "react";
import "./globals.css";

// The real root layout is app/[locale]/layout.tsx, which owns <html lang>.
// This file only exists so the unlocalized not-found page has a parent.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
