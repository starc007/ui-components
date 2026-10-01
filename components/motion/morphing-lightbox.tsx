"use client";

import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import {
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useModalScope } from "@/lib/hooks/use-modal-scope";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  id: string;
  src: string;
  alt: string;
  /** Intrinsic dimensions preserve aspect ratio through the thumbnail morph. */
  width: number;
  height: number;
  caption?: string;
}

export interface MorphingLightboxProps {
  images: LightboxImage[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  label?: string;
  className?: string;
  thumbnailClassName?: string;
  renderCaption?: (image: LightboxImage) => ReactNode;
}

const controlClass =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30";

/** An image gallery with a focus-managed, thumbnail-connected viewer. */
export function MorphingLightbox({
  images,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  label = "Image gallery",
  className,
  thumbnailClassName,
  renderCaption,
}: MorphingLightboxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue === undefined ? internalValue : controlledValue;
  const index = images.findIndex((image) => image.id === value);
  const image = images[index];
  const [mounted, setMounted] = useState(false);
  const groupId = useId();
  const reduce = useReducedMotion() ?? false;
  const portal = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  if (new Set(images.map((item) => item.id)).size !== images.length)
    throw new Error("MorphingLightbox requires unique image ids.");
  if (
    images.some(
      (item) =>
        !Number.isFinite(item.width) ||
        !Number.isFinite(item.height) ||
        item.width <= 0 ||
        item.height <= 0,
    )
  )
    throw new Error("MorphingLightbox requires positive image dimensions.");
  const select = (id: string | null) => {
    if (controlledValue === undefined) setInternalValue(id);
    onValueChange?.(id);
  };
  // Drop removed identities instead of letting a re-added image reopen a session.
  if (controlledValue === undefined && internalValue !== null && index < 0)
    setInternalValue(null);
  useEffect(() => {
    setMounted(true);
  }, []);
  useModalScope(mounted && Boolean(image), portal, panel, () => select(null));
  const selectedId = image?.id;
  const previousId = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    const previous = previousId.current;
    previousId.current = mounted ? selectedId : undefined;
    if (!mounted || !selectedId || !previous || !panel.current) return;
    const focused = document.activeElement;
    if (
      !panel.current.contains(focused) ||
      (focused instanceof HTMLButtonElement && focused.disabled)
    ) {
      panel.current
        .querySelector<HTMLButtonElement>("button:not(:disabled)")
        ?.focus({ preventScroll: true });
    }
  }, [mounted, selectedId]);
  const move = (direction: -1 | 1) => {
    const next = images[index + direction];
    if (next) select(next.id);
  };

  return (
    <LayoutGroup id={groupId}>
      <section
        className={cn(
          "grid w-full grid-cols-2 gap-3 sm:grid-cols-3",
          className,
        )}
        aria-label={label}
      >
        {images.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            aria-label={`Open ${item.alt}`}
            aria-haspopup="dialog"
            aria-expanded={item.id === value && index >= 0}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={SPRING_PRESS}
            onClick={() => select(item.id)}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              thumbnailClassName,
            )}
          >
            {/* biome-ignore lint/performance/noImgElement: Copy-paste registry images must work outside Next.js. */}
            <motion.img
              layoutId={reduce ? undefined : `${groupId}-${item.id}`}
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              loading="lazy"
              draggable={false}
              transition={SPRING_LAYOUT}
              className="block h-auto w-full"
            />
          </motion.button>
        ))}
      </section>
      {mounted &&
        createPortal(
          <div ref={portal}>
            <AnimatePresence>
              {image && (
                <PresenceGate>
                  {({ isPresent, gate }) => (
                    <>
                      <motion.button
                        {...gate}
                        type="button"
                        tabIndex={-1}
                        aria-hidden="true"
                        onClick={() => select(null)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: reduce ? 0.1 : 0.18,
                          ease: EASE_OUT,
                        }}
                        className="fixed inset-0 z-[100] h-full w-full cursor-default bg-black/90"
                      />
                      <div
                        inert={!isPresent}
                        className="pointer-events-none fixed inset-3 z-[101] sm:inset-6"
                      >
                        <div
                          {...gate}
                          ref={panel}
                          role="dialog"
                          aria-modal="true"
                          aria-label={label}
                          tabIndex={-1}
                          className="flex h-full flex-col outline-none"
                          onPointerDownCapture={(event) => {
                            const target = event.target;
                            if (
                              target instanceof Element &&
                              !target.closest("button, [data-lightbox-content]")
                            ) {
                              event.preventDefault();
                              select(null);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (
                              event.altKey ||
                              event.ctrlKey ||
                              event.metaKey ||
                              event.shiftKey
                            )
                              return;
                            if (event.key === "ArrowLeft") {
                              event.preventDefault();
                              move(-1);
                            }
                            if (event.key === "ArrowRight") {
                              event.preventDefault();
                              move(1);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between gap-3 pb-3 text-white">
                            <span
                              className="text-xs tabular-nums"
                              aria-live="polite"
                            >
                              {index + 1} / {images.length}
                            </span>
                            <button
                              type="button"
                              aria-label="Close viewer"
                              onClick={() => select(null)}
                              className={controlClass}
                            >
                              <X size={18} aria-hidden="true" />
                            </button>
                          </div>
                          <LightboxFrame
                            key={`${image.id}-${image.src}`}
                            image={image}
                            layoutId={
                              reduce ? undefined : `${groupId}-${image.id}`
                            }
                            reduce={reduce}
                            onSwipe={move}
                          />
                          <div className="flex items-center justify-between gap-3 pt-3 text-white">
                            <button
                              type="button"
                              aria-label="Previous image"
                              disabled={index === 0}
                              onClick={() => move(-1)}
                              className={controlClass}
                            >
                              <ChevronLeft size={18} aria-hidden="true" />
                            </button>
                            <div
                              data-lightbox-content=""
                              className="min-w-0 text-center text-sm"
                              aria-live="polite"
                            >
                              {renderCaption
                                ? renderCaption(image)
                                : (image.caption ?? image.alt)}
                            </div>
                            <button
                              type="button"
                              aria-label="Next image"
                              disabled={index === images.length - 1}
                              onClick={() => move(1)}
                              className={controlClass}
                            >
                              <ChevronRight size={18} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </PresenceGate>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </LayoutGroup>
  );
}

function LightboxFrame({
  image,
  layoutId,
  reduce,
  onSwipe,
}: {
  image: LightboxImage;
  layoutId?: string;
  reduce: boolean;
  onSwipe: (direction: -1 | 1) => void;
}) {
  const [zoom, setZoom] = useState(false);
  const present = useIsPresent();
  const bounds = useRef<HTMLDivElement>(null);
  const imageBox = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panHelp = useId();
  useLayoutEffect(() => {
    const measure = () => {
      if (!bounds.current || !imageBox.current) return;
      const next = {
        x: Math.max(
          0,
          (imageBox.current.clientWidth * 2 - bounds.current.clientWidth) / 2,
        ),
        y: Math.max(
          0,
          (imageBox.current.clientHeight * 2 - bounds.current.clientHeight) / 2,
        ),
      };
      setPan(next);
      x.set(Math.max(-next.x, Math.min(next.x, x.get())));
      y.set(Math.max(-next.y, Math.min(next.y, y.get())));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (bounds.current) observer.observe(bounds.current);
    if (imageBox.current) observer.observe(imageBox.current);
    return () => observer.disconnect();
  }, [x, y]);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center">
      <div
        ref={bounds}
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg"
      >
        <motion.div
          ref={imageBox}
          data-lightbox-content=""
          layoutId={layoutId}
          transition={SPRING_LAYOUT}
          className="relative flex max-h-full max-w-full items-center justify-center"
          style={{
            aspectRatio: `${image.width} / ${image.height}`,
            width: `min(100%, calc((100dvh - 160px) * ${image.width / image.height}))`,
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: Copy-paste registry images must work outside Next.js. */}
          <motion.img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            draggable={false}
            onError={() => setFailed(true)}
            drag={zoom}
            dragConstraints={{
              left: -pan.x,
              right: pan.x,
              top: -pan.y,
              bottom: pan.y,
            }}
            dragElastic={0.08}
            dragMomentum={false}
            animate={{
              scale: zoom && present ? 2 : 1,
              ...(!present ? { x: 0, y: 0 } : {}),
            }}
            transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
            onPointerDown={(event) => {
              if (!zoom && event.isPrimary)
                swipe.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerUp={(event) => {
              const start = swipe.current;
              swipe.current = null;
              if (!start || zoom) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
                onSwipe(dx < 0 ? 1 : -1);
            }}
            onPointerCancel={() => {
              swipe.current = null;
            }}
            className="block max-h-full w-full select-none object-contain"
            style={{
              x,
              y,
              touchAction: zoom ? "none" : "pan-y",
              cursor: zoom ? "grab" : undefined,
            }}
          />
          {failed && (
            <p
              role="status"
              className="absolute inset-0 flex items-center justify-center bg-neutral-900 p-4 text-center text-sm text-white"
            >
              Unable to load this image.
            </p>
          )}
        </motion.div>
      </div>
      <button
        type="button"
        aria-label={zoom ? "Zoom out" : "Zoom in"}
        aria-pressed={zoom}
        aria-describedby={panHelp}
        onKeyDown={(event) => {
          if (!zoom) return;
          const dx =
            event.key === "ArrowLeft"
              ? -40
              : event.key === "ArrowRight"
                ? 40
                : 0;
          const dy =
            event.key === "ArrowUp" ? -40 : event.key === "ArrowDown" ? 40 : 0;
          if (!dx && !dy) return;
          event.preventDefault();
          event.stopPropagation();
          x.set(Math.max(-pan.x, Math.min(pan.x, x.get() + dx)));
          y.set(Math.max(-pan.y, Math.min(pan.y, y.get() + dy)));
        }}
        onClick={() => {
          x.set(0);
          y.set(0);
          setZoom((current) => !current);
        }}
        className={cn(controlClass, "absolute bottom-3 right-3 bg-black/60")}
      >
        {zoom ? (
          <Minus size={18} aria-hidden="true" />
        ) : (
          <Plus size={18} aria-hidden="true" />
        )}
      </button>
      <span id={panHelp} className="sr-only">
        When zoomed in, drag the image to pan, or keep this control focused and
        use the arrow keys.
      </span>
    </div>
  );
}
