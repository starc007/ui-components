"use client";

import {
  ChevronDown,
  CreditCard,
  Link2,
  LogOut,
  Mail,
  MessageSquare,
  Settings,
  Share2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/motion/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/motion/dropdown-menu";

export function DropdownMenuPreview() {
  const [statusBar, setStatusBar] = useState(true);
  const [compact, setCompact] = useState(false);
  const [panel, setPanel] = useState("bottom");

  return (
    <div className="flex min-h-[360px] w-full items-start justify-center pt-16">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="secondary" size="md" className="group gap-1.5 pr-4">
            Options
            <ChevronDown
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuItem>
            <User aria-hidden="true" />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard aria-hidden="true" />
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings aria-hidden="true" />
            Settings
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Share2 aria-hidden="true" />
              Share
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuItem>
                <Mail aria-hidden="true" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare aria-hidden="true" />
                Message
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 aria-hidden="true" />
                Copy link
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuLabel inset>View</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
            Status bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={compact} onCheckedChange={setCompact}>
            Compact rows
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel inset>Panel</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={panel} onValueChange={setPanel}>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="hidden" disabled>
              Hidden
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem tone="destructive">
            <LogOut aria-hidden="true" />
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
