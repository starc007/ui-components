"use client";

import {
  AlertTriangle,
  Check,
  Diamond,
  type LucideIcon,
  RefreshCw,
  X,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { EASE_OUT, SPRING_PANEL, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export type PixelToastTone = "danger" | "success" | "accent";

export type PixelToastAction = {
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
};

export type PixelToastClassNames = {
  root?: string;
  layer?: string;
  surface?: string;
  icon?: string;
  content?: string;
  title?: string;
  description?: string;
  close?: string;
  action?: string;
  progress?: string;
};

export interface PixelToastProps {
  title: ReactNode;
  description?: ReactNode;
  tone?: PixelToastTone;
  icon?: ReactNode;
  action?: PixelToastAction;
  duration?: number;
  startedAt?: number;
  dismissible?: boolean;
  onDismiss?: () => void;
  showProgress?: boolean;
  showLayers?: boolean;
  className?: string;
  classNames?: PixelToastClassNames;
}

const TONE_STYLE: Record<PixelToastTone, CSSProperties> = {
  danger: {
    "--pixel-toast-accent": "#f87171",
    "--pixel-toast-accent-soft": "rgba(248, 113, 113, 0.28)",
    "--pixel-toast-glow": "rgba(248, 113, 113, 0.18)",
  } as CSSProperties,
  success: {
    "--pixel-toast-accent": "#34d399",
    "--pixel-toast-accent-soft": "rgba(52, 211, 153, 0.28)",
    "--pixel-toast-glow": "rgba(52, 211, 153, 0.18)",
  } as CSSProperties,
  accent: {
    "--pixel-toast-accent": "#818cf8",
    "--pixel-toast-accent-soft": "rgba(129, 140, 248, 0.28)",
    "--pixel-toast-glow": "rgba(129, 140, 248, 0.18)",
  } as CSSProperties,
};

const TONE_ICON: Record<PixelToastTone, LucideIcon> = {
  danger: AlertTriangle,
  success: Check,
  accent: Diamond,
};

const PIXEL_COUNT = 40;
const PIXELS = Array.from({ length: PIXEL_COUNT }, (_, index) => index);

const CONTENT_TRANSITION: Transition = {
  duration: 0.28,
  ease: EASE_OUT,
};

const EXIT_TRANSITION: Transition = {
  duration: 0.18,
  ease: EASE_OUT,
};

function useCountdownProgress({
  duration,
  startedAt,
  enabled,
}: {
  duration: number;
  startedAt: number;
  enabled: boolean;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled || duration <= 0) {
      setProgress(0);
      return;
    }

    let frame = 0;

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(elapsed / duration, 1));

      if (elapsed < duration) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [duration, enabled, startedAt]);

  return progress;
}

function PixelProgressRow({
  progress,
  reduce,
}: {
  progress: number;
  reduce: boolean;
}) {
  const easedProgress = 1 - (1 - progress) ** 3;
  const inactiveCount = Math.floor(easedProgress * PIXEL_COUNT);

  return (
    <div className="flex h-2.5 items-end gap-[3px]" aria-hidden="true">
      {PIXELS.map((pixel) => {
        const isLit = pixel >= inactiveCount;
        const isFrontier = pixel === inactiveCount && inactiveCount < PIXEL_COUNT;

        return (
          <span
            key={pixel}
            className={cn(
              "h-1.5 flex-1 rounded-[2px] bg-white/[0.07] transition-colors duration-200",
              isLit && "bg-(--pixel-toast-accent) shadow-[0_0_8px_var(--pixel-toast-accent-soft)]",
              isFrontier &&
                !reduce &&
                "scale-y-150 shadow-[0_0_12px_1px_var(--pixel-toast-accent)] transition-transform",
            )}
          />
        );
      })}
    </div>
  );
}

export function PixelToast({
  title,
  description,
  tone = "danger",
  icon,
  action,
  duration = 5000,
  startedAt,
  dismissible = true,
  onDismiss,
  showProgress = true,
  showLayers = true,
  className,
  classNames,
}: PixelToastProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [mountedAt] = useState(() => Date.now());
  const resolvedStartedAt = startedAt ?? mountedAt;
  const progress = useCountdownProgress({
    duration,
    startedAt: resolvedStartedAt,
    enabled: showProgress && !reduce,
  });
  const Icon = TONE_ICON[tone];
  const iconNode = icon ?? <Icon className="h-6 w-6" aria-hidden="true" />;
  const progressNode = showProgress ? (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-5 bottom-2.5 flex flex-col gap-[3px]",
        classNames?.progress,
      )}
    >
      <PixelProgressRow progress={progress} reduce={Boolean(reduce)} />
      <PixelProgressRow progress={progress} reduce={Boolean(reduce)} />
    </div>
  ) : null;

  return (
    <div
      className={cn(
        "relative h-[104px] w-full max-w-[520px] [perspective:1200px]",
        classNames?.root,
        className,
      )}
      style={TONE_STYLE[tone]}
    >
      {showLayers ? (
        <>
          <div
            className={cn(
              "absolute inset-0 rounded-2xl border border-white/[0.07] bg-[#111114] opacity-20",
              !reduce && "-translate-y-3.5 scale-[0.93]",
              classNames?.layer,
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-2xl border border-white/[0.07] bg-[#111114] opacity-40",
              !reduce && "-translate-y-2 scale-[0.965]",
              classNames?.layer,
            )}
          />
        </>
      ) : null}

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.94, filter: "blur(6px)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={
          reduce
            ? { opacity: 0, transition: EXIT_TRANSITION }
            : {
                opacity: 0,
                y: -14,
                scale: 0.96,
                filter: "blur(6px)",
                transition: EXIT_TRANSITION,
              }
        }
        whileHover={canHover && !reduce ? { y: -3 } : undefined}
        transition={reduce ? { duration: 0.18, ease: EASE_OUT } : SPRING_PANEL}
        className={cn(
          "absolute inset-0 flex items-center gap-3.5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111114]/95 px-5 pb-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_24px_48px_-12px_rgba(0,0,0,0.65),0_0_46px_-8px_var(--pixel-toast-glow)] backdrop-blur-2xl",
          classNames?.surface,
        )}
      >
        <motion.span
          key={`icon-${tone}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
          transition={reduce ? CONTENT_TRANSITION : SPRING_PRESS}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center text-(--pixel-toast-accent)",
            classNames?.icon,
          )}
        >
          {iconNode}
        </motion.span>

        <div className={cn("min-w-0 flex-1", classNames?.content)}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${tone}-${String(title)}-${String(description)}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={CONTENT_TRANSITION}
            >
              <p
                className={cn(
                  "truncate text-[16.5px] font-semibold leading-snug tracking-normal",
                  classNames?.title,
                )}
              >
                {title}
              </p>
              {description ? (
                <p
                  className={cn(
                    "mt-0.5 truncate text-[13.5px] font-medium leading-snug text-zinc-400",
                    classNames?.description,
                  )}
                >
                  {description}
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {dismissible ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss toast"
            className={cn(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200",
              classNames?.close,
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}

        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(
              "group relative ml-1 inline-flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-[10px] border border-white/[0.08] bg-white/[0.045] px-4 text-[13.5px] font-semibold text-white transition-colors hover:border-white/15 hover:bg-white/[0.075]",
              classNames?.action,
            )}
          >
            <span className="absolute inset-0 translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:-translate-x-full" />
            {action.icon ? (
              <span className="relative text-(--pixel-toast-accent)">
                {action.icon}
              </span>
            ) : null}
            <span className="relative">{action.label}</span>
          </button>
        ) : null}

        {progressNode}
      </motion.div>
    </div>
  );
}

export const pixelToastPresets = [
  {
    id: "rate-limit",
    label: "Rate limit",
    tone: "danger",
    title: "Rate limit reached",
    description: "retrying in 30s",
    action: {
      label: "Upgrade",
      icon: <Zap className="h-4 w-4" aria-hidden="true" />,
    },
    icon: <AlertTriangle className="h-6 w-6" aria-hidden="true" />,
    duration: 30000,
  },
  {
    id: "saved",
    label: "Changes saved",
    tone: "success",
    title: "Changes saved",
    description: "Atlas redesign - 12 files",
    action: {
      label: "View",
      icon: <RefreshCw className="h-4 w-4" aria-hidden="true" />,
    },
    icon: <Check className="h-6 w-6" aria-hidden="true" />,
    duration: 5000,
  },
  {
    id: "deploy-failed",
    label: "Deploy failed",
    tone: "danger",
    title: "Deploy failed",
    description: "build step exited with code 1",
    action: {
      label: "Retry",
      icon: <RefreshCw className="h-4 w-4" aria-hidden="true" />,
    },
    icon: <AlertTriangle className="h-6 w-6" aria-hidden="true" />,
    duration: 8000,
  },
  {
    id: "call-joined",
    label: "Call joined",
    tone: "accent",
    title: "Maya joined the call",
    description: "Design review - room 4",
    icon: <Diamond className="h-6 w-6" aria-hidden="true" />,
    duration: 6000,
  },
] satisfies Array<{
  id: string;
  label: string;
  tone: PixelToastTone;
  title: string;
  description: string;
  action?: PixelToastAction;
  icon: ReactNode;
  duration: number;
}>;

export function usePixelToastPreset(index: number) {
  return useMemo(() => pixelToastPresets[index] ?? pixelToastPresets[0], [index]);
}
