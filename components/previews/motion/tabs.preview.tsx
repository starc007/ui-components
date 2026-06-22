"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";

export function TabsPreview() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <Section title="Pill">
        <Tabs defaultValue="overview" variant="pill">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-sm text-muted-foreground">High-level summary.</TabsContent>
          <TabsContent value="activity" className="text-sm text-muted-foreground">Recent events.</TabsContent>
          <TabsContent value="settings" className="text-sm text-muted-foreground">Preferences.</TabsContent>
        </Tabs>
      </Section>
      <Section title="Segment">
        <Tabs defaultValue="day" variant="segment">
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </Section>
      <Section title="Underline">
        <Tabs defaultValue="all" variant="underline">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      {children}
    </div>
  );
}
