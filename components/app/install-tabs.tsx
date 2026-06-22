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
    <Tabs defaultValue="cli" variant="segment">
      <TabsList>
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
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
