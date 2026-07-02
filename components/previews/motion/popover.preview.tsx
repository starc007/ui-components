"use client";

import { useState } from "react";
import { Bell, ChevronDown, Shield, Sparkles } from "lucide-react";
import { Popover } from "@/components/motion/popover";

export function PopoverPreview() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [placementOpen, setPlacementOpen] = useState<null | "top" | "right" | "left">(null);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 space-y-1">
            <p className="text-sm font-semibold text-foreground">Action menu</p>
            <p className="text-xs text-muted-foreground">
              Controlled open state with a compact profile action list.
            </p>
          </div>
          <Popover
            open={menuOpen}
            onOpenChange={setMenuOpen}
            side="bottom"
            align="start"
            animationStyle="spring"
            closeOnContentClick
            trigger={
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Edit profile
                <ChevronDown className="h-4 w-4" />
              </button>
            }
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Quick actions</p>
                <p className="text-xs text-muted-foreground">
                  Keep this profile menu lightweight and keyboard friendly.
                </p>
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Account settings
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Notification preferences
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                >
                  Sign out
                </button>
              </div>
            </div>
          </Popover>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 space-y-1">
            <p className="text-sm font-semibold text-foreground">Info card</p>
            <p className="text-xs text-muted-foreground">
              Uncontrolled popover for quick CTA and summary details.
            </p>
          </div>
          <Popover
            side="bottom"
            align="center"
            animationStyle="soft"
            widthClassName="w-64"
            trigger={
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-card/70"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade preview
              </button>
            }
          >
            <div className="space-y-3">
              <p className="text-sm font-semibold">Pro workspace</p>
              <p className="text-xs text-muted-foreground">
                Enable advanced analytics, unlimited history, and priority sync.
              </p>
              <button
                type="button"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start free trial
              </button>
            </div>
          </Popover>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 space-y-1">
            <p className="text-sm font-semibold text-foreground">Reactions picker</p>
            <p className="text-xs text-muted-foreground">
              Compact utility popover with a faster, drift-style entrance.
            </p>
          </div>
          <Popover
            side="top"
            align="start"
            animationStyle="drift"
            closeOnContentClick
            widthClassName="w-52"
            trigger={
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-card/70"
              >
                Add reaction
              </button>
            }
          >
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">React quickly</p>
              <div className="grid grid-cols-4 gap-1.5">
                {["🔥", "👏", "🎉", "💯", "😍", "🤝", "🚀", "🫡"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="inline-flex h-8 items-center justify-center rounded-md text-base transition-colors hover:bg-accent"
                    aria-label={`React ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </Popover>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 space-y-1">
            <p className="text-sm font-semibold text-foreground">Security hint</p>
            <p className="text-xs text-muted-foreground">
              Contextual helper anchored to the right with restrained motion.
            </p>
          </div>
          <Popover
            side="right"
            align="start"
            animationStyle="soft"
            widthClassName="w-60"
            trigger={
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-card/70"
              >
                <Shield className="h-4 w-4" />
                Security tips
              </button>
            }
          >
            <div className="space-y-2">
              <p className="text-sm font-medium">Protect your workspace</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Use passkeys for passwordless sign-in.</li>
                <li>Enable 2FA for all collaborators.</li>
                <li>Rotate personal access tokens monthly.</li>
              </ul>
            </div>
          </Popover>
        </section>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/40 p-4">
        <div className="mb-3 space-y-1">
          <p className="text-sm font-semibold text-foreground">Placement examples</p>
          <p className="text-xs text-muted-foreground">Top, right and left panel directions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover
            open={placementOpen === "top"}
            onOpenChange={(next) => setPlacementOpen(next ? "top" : null)}
            side="top"
            align="center"
            widthClassName="w-56"
            trigger={
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:bg-card/70"
              >
                <Bell className="h-4 w-4" />
                Top
              </button>
            }
          >
            <p className="text-sm">You have 3 unread notifications.</p>
          </Popover>

          <Popover
            open={placementOpen === "right"}
            onOpenChange={(next) => setPlacementOpen(next ? "right" : null)}
            side="right"
            align="center"
            widthClassName="w-56"
            trigger={
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:bg-card/70"
              >
                <Shield className="h-4 w-4" />
                Right
              </button>
            }
          >
            <p className="text-sm">2-factor authentication is enabled.</p>
          </Popover>

          <Popover
            open={placementOpen === "left"}
            onOpenChange={(next) => setPlacementOpen(next ? "left" : null)}
            side="left"
            align="center"
            widthClassName="w-56"
            trigger={
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:bg-card/70"
              >
                <Shield className="h-4 w-4" />
                Left
              </button>
            }
          >
            <p className="text-sm">Session expires in 14 minutes.</p>
          </Popover>
        </div>
      </section>
    </div>
  );
}
