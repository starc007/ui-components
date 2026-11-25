"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnimatedToast, ToastInput, UseAnimatedToastStackOptions } from "./types";

let idSeed = 0;

function createToast(input: ToastInput, defaultDuration: number): AnimatedToast {
  return {
    duration: defaultDuration,
    dismissible: true,
    ...input,
    id: input.id ?? `toast-${Date.now()}-${idSeed++}`,
    createdAt: Date.now(),
  };
}

type ToastTimer = {
  /** createdAt and duration: a change restarts the countdown. */
  signature: string;
  /** Time left when not running. */
  remaining: number;
  /** When it fires, while running. */
  deadline: number;
  timer: number | null;
};

export function useAnimatedToastStack({
  initialToasts = [],
  defaultDuration = 4200,
  limit,
}: UseAnimatedToastStackOptions = {}) {
  const toastTimers = useRef<Map<string, ToastTimer>>(new Map());
  // Countdowns stop while the stack is hovered or focused, and while the tab
  // is hidden, so a toast never runs out while someone is reading it or away.
  const hold = useRef({ hovered: false, hidden: false });
  const [toasts, setToasts] = useState<AnimatedToast[]>(() =>
    initialToasts.map((toast) => createToast(toast, defaultDuration)),
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const toast = createToast(input, defaultDuration);
      setToasts((current) => {
        const next = [...current, toast];
        return typeof limit === "number" ? next.slice(-limit) : next;
      });
      return toast.id;
    },
    [defaultDuration, limit],
  );

  const updateToast = useCallback((id: string, patch: Partial<ToastInput>) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id
          ? {
              ...toast,
              ...patch,
              id,
              createdAt: patch.duration === undefined ? toast.createdAt : Date.now(),
            }
          : toast,
      ),
    );
  }, []);

  const run = useCallback(
    (id: string, entry: ToastTimer) => {
      entry.deadline = Date.now() + entry.remaining;
      entry.timer = window.setTimeout(() => {
        toastTimers.current.delete(id);
        dismissToast(id);
      }, entry.remaining);
    },
    [dismissToast],
  );

  const stopAll = useCallback(() => {
    toastTimers.current.forEach((entry) => {
      if (entry.timer === null) return;
      window.clearTimeout(entry.timer);
      entry.timer = null;
      entry.remaining = Math.max(entry.deadline - Date.now(), 0);
    });
  }, []);

  const startAll = useCallback(() => {
    if (hold.current.hovered || hold.current.hidden) return;
    toastTimers.current.forEach((entry, id) => {
      if (entry.timer === null) run(id, entry);
    });
  }, [run]);

  useEffect(() => {
    const activeIds = new Set(toasts.map((toast) => toast.id));

    toastTimers.current.forEach((entry, id) => {
      if (!activeIds.has(id)) {
        if (entry.timer !== null) window.clearTimeout(entry.timer);
        toastTimers.current.delete(id);
      }
    });

    toasts.forEach((toast) => {
      const duration = toast.duration ?? defaultDuration;
      const existing = toastTimers.current.get(toast.id);

      if (duration <= 0) {
        if (existing) {
          if (existing.timer !== null) window.clearTimeout(existing.timer);
          toastTimers.current.delete(toast.id);
        }
        return;
      }

      const createdAt = toast.createdAt ?? Date.now();
      const signature = `${createdAt}:${duration}`;

      if (existing?.signature === signature) {
        return;
      }

      if (existing?.timer != null) {
        window.clearTimeout(existing.timer);
      }

      const entry: ToastTimer = {
        signature,
        remaining: Math.max(duration - (Date.now() - createdAt), 0),
        deadline: 0,
        timer: null,
      };
      toastTimers.current.set(toast.id, entry);
      // A toast that arrives while the stack is held waits its full time.
      if (!hold.current.hovered && !hold.current.hidden) run(toast.id, entry);
    });
  }, [defaultDuration, run, toasts]);

  useEffect(() => {
    const onVisibility = () => {
      hold.current.hidden = document.hidden;
      if (document.hidden) stopAll();
      else startAll();
    };
    hold.current.hidden = document.hidden;
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [stopAll, startAll]);

  useEffect(() => {
    const timers = toastTimers.current;

    return () => {
      timers.forEach((entry) => {
        if (entry.timer !== null) window.clearTimeout(entry.timer);
      });
      timers.clear();
    };
  }, []);

  /** Stop every countdown, e.g. while the stack is open. Pass to the stack's `onPause`. */
  const pause = useCallback(() => {
    hold.current.hovered = true;
    stopAll();
  }, [stopAll]);

  /** Restart them with the time each had left. Pass to the stack's `onResume`. */
  const resume = useCallback(() => {
    hold.current.hovered = false;
    startAll();
  }, [startAll]);

  return useMemo(
    () => ({
      toasts,
      showToast,
      updateToast,
      dismissToast,
      clearToasts,
      setToasts,
      pause,
      resume,
    }),
    [clearToasts, dismissToast, showToast, toasts, updateToast, pause, resume],
  );
}
