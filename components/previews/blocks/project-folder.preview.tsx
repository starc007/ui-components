"use client";

import { ProjectFolder } from "@/components/motion/project-folder";

const previews = [
  { id: "moss", color: "bg-emerald-200", mark: "A" },
  { id: "clay", color: "bg-orange-200", mark: "B" },
  { id: "sky", color: "bg-sky-200", mark: "C" },
  { id: "lilac", color: "bg-violet-200", mark: "D" },
  { id: "sand", color: "bg-amber-100", mark: "E" },
].map((preview) => ({
  id: preview.id,
  content: (
    <span className={cn("relative block h-full w-full", preview.color)}>
      <span className="absolute left-3 top-3 h-2 w-8 rounded-full bg-black/15" />
      <span className="absolute inset-x-3 top-8 h-px bg-black/10" />
      <span className="absolute inset-x-3 top-11 h-px bg-black/10" />
      <span className="absolute bottom-3 right-3 text-sm font-medium text-black/50">
        {preview.mark}
      </span>
    </span>
  ),
}));

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function ProjectFolderPreview() {
  return (
    <div className="flex min-h-80 w-full items-center justify-center px-6 py-10">
      <ProjectFolder
        title="Brand direction"
        description="Updated recently"
        count={5}
        previews={previews}
        onClick={() => {}}
      />
    </div>
  );
}
