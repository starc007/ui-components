"use client";

import { useReducedMotion } from "motion/react";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { ProCard } from "@/components/app/docs/pro-card";
import { cn } from "@/lib/utils";

export type PageNavItem = {
  id: string;
  label: string;
  children?: PageNavItem[];
};

export function PageNav({ items }: { items: PageNavItem[] }) {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const scrollTargetRef = useRef<string | null>(null);
  const scrollSettleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;
    const flatItems = items.flatMap((item) => [item, ...(item.children ?? [])]);

    const updateActiveSection = () => {
      frame = 0;
      const scrollTarget = scrollTargetRef.current;
      if (scrollTarget) {
        setActiveId((current) =>
          current === scrollTarget ? current : scrollTarget,
        );
        return;
      }

      const anchorOffset = 112;
      let nextId = flatItems[0]?.id ?? "";

      for (const item of flatItems) {
        const section = document.getElementById(item.id);
        if (!section || section.getBoundingClientRect().top > anchorOffset)
          break;
        nextId = item.id;
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
        nextId = flatItems.at(-1)?.id ?? nextId;
      }

      setActiveId((current) => (current === nextId ? current : nextId));
    };

    const scheduleUpdate = () => {
      if (scrollTargetRef.current) {
        if (scrollSettleTimerRef.current) {
          window.clearTimeout(scrollSettleTimerRef.current);
        }
        scrollSettleTimerRef.current = window.setTimeout(() => {
          scrollTargetRef.current = null;
          scrollSettleTimerRef.current = null;
          updateActiveSection();
        }, 1000);
      }

      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    const finishProgrammaticScroll = () => {
      if (!scrollTargetRef.current) return;
      scrollTargetRef.current = null;
      if (scrollSettleTimerRef.current) {
        window.clearTimeout(scrollSettleTimerRef.current);
        scrollSettleTimerRef.current = null;
      }
      updateActiveSection();
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("scrollend", finishProgrammaticScroll);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("scrollend", finishProgrammaticScroll);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      if (scrollSettleTimerRef.current) {
        window.clearTimeout(scrollSettleTimerRef.current);
      }
    };
  }, [items]);

  const scrollToSection = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    const section = document.getElementById(id);
    if (!section) return;

    event.preventDefault();
    window.history.replaceState(window.history.state, "", `#${id}`);
    scrollTargetRef.current = reduce ? null : id;
    if (scrollSettleTimerRef.current) {
      window.clearTimeout(scrollSettleTimerRef.current);
    }
    scrollSettleTimerRef.current = window.setTimeout(() => {
      scrollTargetRef.current = null;
      scrollSettleTimerRef.current = null;
    }, 1000);
    setActiveId(id);
    section.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  const navLink = (item: PageNavItem, nested = false) => {
    const active = activeId === item.id;

    return (
      <a
        href={`#${item.id}`}
        aria-current={active ? "location" : undefined}
        onClick={(event) => scrollToSection(event, item.id)}
        className={cn(
          "relative flex min-h-8 items-center rounded-md text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          nested ? "pl-4 font-normal" : "font-medium",
          active ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {active ? (
          <span
            aria-hidden="true"
            className="absolute top-1/2 -left-3 h-5 w-px -translate-y-1/2 bg-foreground"
          />
        ) : null}
        {item.label}
      </a>
    );
  };

  return (
    <aside aria-label="On this page" className="hidden min-w-0 xl:block">
      <div className="fixed top-24 right-8 z-10 max-h-[calc(100vh-8rem)] w-64 overflow-y-auto scrollbar-hide">
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          On this page
        </p>
        <nav>
          <ul className="flex flex-col">
            {items.map((item) => {
              return (
                <li key={item.id}>
                  {navLink(item)}
                  {item.children?.length ? (
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.id}>{navLink(child, true)}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
        <ProCard />
      </div>
    </aside>
  );
}
