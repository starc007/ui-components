"use client";

import { useEffect } from "react";
import type { ModelContext } from "@/lib/webmcp";

let registered = false;

/**
 * Gives AI agents in the tab beUI's WebMCP tools (lib/webmcp.ts) where the
 * browser supports WebMCP. Elsewhere it does nothing and loads nothing: the
 * tools and the catalog they read are fetched only when an agent can use them.
 */
export function WebMcpTools() {
  useEffect(() => {
    if (registered) return;
    const context =
      (document as Document & { modelContext?: ModelContext }).modelContext ??
      (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    registered = true;
    void import("@/lib/webmcp").then(({ registerSiteTools }) => registerSiteTools(context));
  }, []);

  return null;
}
