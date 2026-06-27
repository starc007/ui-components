"use client";

import { Calendar, Home, Mail, Music, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import { GithubIcon } from "@/components/app/icons";
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock";

export function DockPreview() {
  const [active, setActive] = useState("home");
  const items = [
    { id: "home", icon: Home, label: "Home" },
    { id: "mail", icon: Mail, label: "Mail" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "music", icon: Music, label: "Music" },
    { id: "discover", icon: Sparkles, label: "Discover" },
  ];

  return (
    <div className="flex w-full justify-center">
      <Dock>
        {items.map(({ id, icon: Icon, label }) => (
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
          <GithubIcon className="h-5 w-5" />
        </DockItem>
      </Dock>
    </div>
  );
}
