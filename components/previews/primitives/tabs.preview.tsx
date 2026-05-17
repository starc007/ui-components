"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsPreview() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-(--color-fg-muted)">High-level summary of the workspace.</TabsContent>
      <TabsContent value="activity" className="text-sm text-(--color-fg-muted)">Recent events from your team.</TabsContent>
      <TabsContent value="settings" className="text-sm text-(--color-fg-muted)">Preferences and integrations.</TabsContent>
    </Tabs>
  );
}
