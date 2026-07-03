"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AccountAvatar } from "./account-avatar";
import { HEAD, ITEM, LIST, MORPH } from "./constants";
import { CopyButton } from "./copy-button";
import type { WalletAccount } from "./types";
import { useDismiss } from "./use-dismiss";
import { truncateAddress } from "./utils";

/**
 * Account switcher whose trigger morphs into a panel that grows rightward to
 * full width (covering the header icons) and downward at the same time, via a
 * shared layoutId. Self-contained — not the generic MorphSelect.
 */
export function AccountSwitcher({
  accounts,
  activeAccount,
  onSelect,
}: {
  accounts: WalletAccount[];
  activeAccount: WalletAccount | undefined;
  onSelect: (id: string) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const layoutId = `${useId()}-account`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // Hover only arms after the morph settles — otherwise the panel expands under
  // the cursor and flashes a phantom hover bg on whatever item it lands on.
  const [armed, setArmed] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(open, close, rootRef);

  useEffect(() => {
    if (!open) {
      setArmed(false);
      return;
    }
    const t = window.setTimeout(() => setArmed(true), reduce ? 0 : 280);
    return () => window.clearTimeout(t);
  }, [open, reduce]);

  const morph = reduce ? { duration: 0 } : MORPH;

  return (
    // static (not relative) so the absolute trigger + panel anchor to the
    // header row and can span its full width, covering the icons.
    <div ref={rootRef} className="min-w-0">
      {/* in-flow sizer: reserves the widest possible trigger footprint (every
          account name stacked in one grid cell) so the header row width never
          changes — neither when the trigger leaves the flow nor when a shorter
          account name is selected. */}
      <div aria-hidden className={cn(HEAD, "pointer-events-none opacity-0")}>
        <AccountAvatar account={activeAccount ?? accounts[0]} />
        <span className="grid">
          {accounts.map((account) => (
            <span
              key={account.id}
              className="col-start-1 row-start-1 whitespace-nowrap text-sm font-medium"
            >
              {account.name}
            </span>
          ))}
        </span>
        <ChevronDown className="h-4 w-4" />
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {open ? null : (
          <motion.button
            key="trigger"
            layoutId={layoutId}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={false}
            onClick={() => setOpen(true)}
            transition={morph}
            style={{ borderRadius: 16 }}
            className={cn(
              HEAD,
              // shifted left by the padding so the avatar sits flush with the
              // card content edge (aligned with the balance + buttons below).
              "absolute top-0 -left-2 z-20 max-w-full outline-none transition-colors hover:bg-muted/60",
            )}
          >
            {activeAccount ? (
              <>
                <AccountAvatar account={activeAccount} />
                <motion.span
                  layout="position"
                  className="truncate text-sm font-medium text-foreground"
                >
                  {activeAccount.name}
                </motion.span>
                <motion.span layout="position" className="text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </>
            ) : null}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.div
            key="panel"
            layoutId={layoutId}
            role="listbox"
            transition={morph}
            style={{ borderRadius: 16 }}
            className="absolute top-0 -right-2 -left-2 z-30 overflow-hidden border border-border/30 bg-background backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={cn(HEAD, "w-full outline-none")}
            >
              {activeAccount ? <AccountAvatar account={activeAccount} /> : null}
              <motion.span
                layout="position"
                className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
              >
                {activeAccount?.name ?? "Select account"}
              </motion.span>
              <motion.span
                layout="position"
                animate={{ rotate: 180 }}
                transition={morph}
                className="text-muted-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>

            <motion.ul
              initial="hidden"
              animate="show"
              variants={reduce ? undefined : LIST}
              className={cn(
                "max-h-64 overflow-y-auto p-1.5",
                armed ? "" : "pointer-events-none",
              )}
            >
              {accounts.map((account) => {
                const selected = account.id === activeAccount?.id;
                return (
                  <motion.li
                    key={account.id}
                    variants={reduce ? undefined : ITEM}
                    className={cn(
                      "flex items-center rounded-xl pr-1 text-sm transition-colors",
                      selected
                        ? "bg-muted text-foreground"
                        : cn(
                            "text-muted-foreground",
                            armed && "hover:bg-muted hover:text-foreground",
                          ),
                    )}
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onSelect(account.id);
                        setOpen(false);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2 text-left outline-none"
                    >
                      <AccountAvatar account={account} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">
                          {account.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {truncateAddress(account.address)}
                        </span>
                      </span>
                      {selected ? (
                        <Check className="h-4 w-4 shrink-0 text-foreground" />
                      ) : null}
                    </button>
                    <CopyButton value={account.address} />
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
