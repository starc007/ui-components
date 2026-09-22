"use client";

import type { ReactNode } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/motion/tabs";

/**
 * CLI / Manual switch for installing a component. Both panels are rendered on
 * the server and passed in as nodes; this only owns the tab state.
 */
export function InstallTabs({
  cli,
  manual,
}: {
  cli: ReactNode;
  manual: ReactNode;
}) {
  return (
    <Tabs defaultValue="cli" variant="pill">
      <TabsList>
        <TabsTrigger
          value="cli"
          indicatorClassName="bg-background"
          className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
        >
          CLI
        </TabsTrigger>
        <TabsTrigger
          value="manual"
          indicatorClassName="bg-background"
          className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
        >
          Manual
        </TabsTrigger>
      </TabsList>
      <TabsContent value="cli" className="mt-4">
        {cli}
      </TabsContent>
      <TabsContent value="manual" className="mt-4">
        {manual}
      </TabsContent>
    </Tabs>
  );
}
