"use client";

import { Calendar, Compass, Home, Mail, Music, Settings } from "lucide-react";
import { type SVGProps, useState } from "react";
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock";

const ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "mail", icon: Mail, label: "Mail" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "music", icon: Music, label: "Music" },
  { id: "discover", icon: Compass, label: "Discover" },
];

/** The GitHub mark, inline so this example imports nothing but the Dock. */
function GithubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.65.5.5 5.65.5 12.02c0 5.1 3.29 9.43 7.86 10.96.58.1.79-.25.79-.56v-2.01c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.87-.39.97 0 1.96.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.27 5.68.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56 4.57-1.53 7.85-5.86 7.85-10.96C23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  );
}

export function DockPreview() {
  const [active, setActive] = useState("home");

  return (
    <div className="flex w-full justify-center">
      <Dock>
        {ITEMS.map(({ id, icon: Icon, label }) => (
          <DockItem
            key={id}
            aria-label={label}
            active={active === id}
            onClick={() => setActive(id)}
          >
            <Icon className="h-5 w-5" />
          </DockItem>
        ))}
        <DockSeparator />
        <DockItem
          aria-label="Settings"
          active={active === "settings"}
          onClick={() => setActive("settings")}
        >
          <Settings className="h-5 w-5" />
        </DockItem>
        <DockItem aria-label="GitHub">
          <GithubMark className="h-5 w-5" />
        </DockItem>
      </Dock>
    </div>
  );
}
