"use client";

import {
  CalendarClock,
  FileText,
  FolderKanban,
  PackageCheck,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";

const items = [
  {
    id: "brief",
    title: "Release Brief",
    description:
      "Collect launch notes, owners, and risks in one compact handoff before the release window opens.",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "launch",
    title: "Launch Checklist",
    description:
      "Verify copy, links, analytics, rollback steps, and final approvals without leaving the queue.",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    id: "campaign",
    title: "Campaign Notes",
    description:
      "Keep channel-specific notes close to the task while preserving a calm collapsed list.",
    icon: <RadioTower className="h-4 w-4" />,
  },
  {
    id: "calendar",
    title: "Rollout Calendar",
    description:
      "Plan announcements, staging checks, reminders, and quiet periods around the same timeline.",
    icon: <CalendarClock className="h-4 w-4" />,
  },
  {
    id: "ship",
    title: "Ship Build",
    description:
      "Track the current artifact, deploy status, and final sign-off before marking the release complete.",
    icon: <PackageCheck className="h-4 w-4" />,
  },
  {
    id: "archive",
    title: "Archive Assets",
    description:
      "Move final copy, images, and source files into the campaign folder once the rollout is done.",
    icon: <FolderKanban className="h-4 w-4" />,
  },
];

export function BouncyAccordionPreview() {
  return (
    <div className="flex min-h-96 w-full items-center justify-center">
      <div className="w-full max-w-sm h-[480px]">
        <BouncyAccordion items={items} defaultValue="calendar" />
      </div>
    </div>
  );
}
