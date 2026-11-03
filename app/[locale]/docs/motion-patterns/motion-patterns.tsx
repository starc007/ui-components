"use client";

import {
  Accessibility,
  Bell,
  CircleGauge,
  type LucideIcon,
  MousePointer2,
  PanelTopOpen,
  RefreshCw,
  Rows3,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useTranslations } from "next-intl";
import { type ReactNode, useId, useState } from "react";
import {
  EASE_IN_OUT,
  EASE_OUT,
  SPRING_PRESS,
} from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

type RecipeDemo = "press" | "icon" | "reveal" | "layout" | "swap";

const CONTINUITY_SPRING: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 17,
  mass: 0.85,
};

const CONTINUITY_LABEL: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
};

type Recipe = {
  key: "press" | "icon" | "reveal" | "layout" | "swap";
  icon: LucideIcon;
  demo: RecipeDemo;
  code: string;
};

const decisions = [
  { number: "01", key: "frequency" },
  { number: "02", key: "purpose" },
  { number: "03", key: "physics" },
  { number: "04", key: "fallback" },
] as const;

const timings = [
  "press",
  "tooltip",
  "dropdown",
  "modal",
  "marketing",
] as const;

const recipes: Recipe[] = [
  {
    key: "press",
    icon: MousePointer2,
    demo: "press",
    code: `import { motion, useReducedMotion } from "motion/react";
import { SPRING_PRESS } from "@/lib/ease";

const reduce = useReducedMotion();

<motion.button
  whileTap={reduce ? undefined : { scale: 0.97 }}
  transition={SPRING_PRESS}
>
  Continue
</motion.button>`,
  },
  {
    key: "icon",
    icon: Bell,
    demo: "icon",
    code: `const reduce = useReducedMotion();
const canHover = useHoverCapable();

<motion.span
  style={{ transformOrigin: "top center" }}
  animate={active && canHover && !reduce
    ? { rotate: [0, 12, -8, 4, 0] }
    : { rotate: 0 }}
  transition={{ duration: 0.28, ease: EASE_OUT }}
>
  <Bell />
</motion.span>`,
  },
  {
    key: "reveal",
    icon: Sparkles,
    demo: "reveal",
    code: `const reduce = useReducedMotion();

<motion.div
  initial={{
    opacity: 0,
    transform: reduce ? "none" : "translateY(8px)",
    filter: reduce ? "none" : "blur(4px)",
  }}
  animate={{
    opacity: 1,
    transform: "translateY(0px)",
    filter: "blur(0px)",
  }}
  transition={{ duration: 0.22, ease: EASE_OUT }}
/>`,
  },
  {
    key: "layout",
    icon: PanelTopOpen,
    demo: "layout",
    code: `<motion.div layout transition={CONTINUITY_SPRING}>
  <motion.button layout transition={CONTINUITY_SPRING}>
    <motion.span layout="position">
      <PanelTopOpen />
    </motion.span>

    <AnimatePresence mode="popLayout" initial={false}>
      {expanded ? (
        <motion.span
          layout
          variants={CONTINUITY_LABEL}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={CONTINUITY_SPRING}
        >
          Open panel
        </motion.span>
      ) : null}
    </AnimatePresence>
  </motion.button>
</motion.div>`,
  },
  {
    key: "swap",
    icon: Rows3,
    demo: "swap",
    code: `<AnimatePresence mode="wait" initial={false}>
  <motion.div
    key={tab}
    initial={{ opacity: 0, transform: "translateY(4px)" }}
    animate={{ opacity: 1, transform: "translateY(0px)" }}
    exit={{
      opacity: 0,
      transform: "translateY(-4px)",
      transition: { duration: 0.12, ease: EASE_OUT },
    }}
    transition={{ duration: 0.18, ease: EASE_OUT }}
  />
</AnimatePresence>`,
  },
];

export function MotionPatterns() {
  const t = useTranslations("Pages.motionPatterns");

  return (
    <div className="mt-12 space-y-20">
      <GuideSection
        id="decision-framework"
        eyebrow={t("sections.decisionFramework.eyebrow")}
        title={t("sections.decisionFramework.title")}
        description={t("sections.decisionFramework.description")}
      >
        <div className="divide-y divide-border border-y border-border">
          {decisions.map((decision) => (
            <article
              key={decision.number}
              className="grid gap-3 py-5 sm:grid-cols-[3rem_10rem_minmax(0,1fr)] sm:gap-5 sm:py-6"
            >
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {decision.number}
              </span>
              <h3 className="text-sm font-medium text-foreground">
                {t(`decisions.${decision.key}.title`)}
              </h3>
              <div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t(`decisions.${decision.key}.body`)}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {t(`decisions.${decision.key}.note`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </GuideSection>

      <GuideSection
        id="motion-tokens"
        eyebrow={t("sections.motionTokens.eyebrow")}
        title={t("sections.motionTokens.title")}
        description={t("sections.motionTokens.description")}
      >
        <EasingLab />
      </GuideSection>

      <GuideSection
        id="timing"
        eyebrow={t("sections.timing.eyebrow")}
        title={t("sections.timing.title")}
        description={t("sections.timing.description")}
      >
        <div className="border-y border-border">
          <div className="hidden grid-cols-[1fr_8rem_1.4fr] gap-4 border-b border-border bg-card px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:grid">
            <span>{t("timing.interaction")}</span>
            <span>{t("timing.range")}</span>
            <span>{t("timing.desiredFeel")}</span>
          </div>
          {timings.map((timing) => (
            <div
              key={timing}
              className="grid gap-1 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_8rem_1.4fr] sm:items-center sm:gap-4"
            >
              <span className="text-sm font-medium text-foreground">
                {t(`timing.rows.${timing}.use`)}
              </span>
              <span className="font-mono text-xs text-foreground">
                {t(`timing.rows.${timing}.range`)}
              </span>
              <span className="text-sm text-muted-foreground">
                {t(`timing.rows.${timing}.feel`)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-3 border-l border-border py-1 pl-4">
          <Zap className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted-foreground">
            {t("timing.note")}
          </p>
        </div>
      </GuideSection>

      <GuideSection
        id="recipes"
        eyebrow={t("sections.recipes.eyebrow")}
        title={t("sections.recipes.title")}
        description={t("sections.recipes.description")}
      >
        <div className="divide-y divide-border border-y border-border">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.key} recipe={recipe} />
          ))}
        </div>
      </GuideSection>

      <GuideSection
        id="accessibility"
        eyebrow={t("sections.accessibility.eyebrow")}
        title={t("sections.accessibility.title")}
        description={t("sections.accessibility.description")}
      >
        <div className="grid border-y border-border lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-border py-6 lg:border-r lg:border-b-0 lg:pr-8">
            <Accessibility className="size-5 text-foreground" aria-hidden="true" />
            <h3 className="mt-8 text-base font-medium text-foreground">
              {t("accessibility.title")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("accessibility.body")}
            </p>
          </div>
          <CodeRecipe
            alwaysOpen
            code={`const reduce = useReducedMotion();

const hidden = {
  opacity: 0,
  transform: reduce ? "none" : "translateY(8px)",
};

const visible = {
  opacity: 1,
  transform: "translateY(0px)",
};`}
          />
        </div>
      </GuideSection>
    </div>
  );
}

function GuideSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-medium tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function EasingLab() {
  const t = useTranslations("Pages.motionPatterns.easing");
  const [replay, setReplay] = useState(0);
  const reduce = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex items-start justify-between gap-4 border-b border-border bg-card px-5 py-4">
        <div>
          <p className="text-sm font-medium text-foreground">{t("title")}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <ReplayButton
          onClick={() => setReplay((current) => current + 1)}
          reduce={Boolean(reduce)}
        />
      </div>
      <div className="grid gap-px bg-border md:grid-cols-2">
        <EasingTrack
          key={`out-${replay}`}
          label="EASE_OUT"
          value="[0.16, 1, 0.3, 1]"
          description={t("easeOut")}
          ease={EASE_OUT}
          reduce={Boolean(reduce)}
        />
        <EasingTrack
          key={`in-out-${replay}`}
          label="EASE_IN_OUT"
          value="[0.77, 0, 0.175, 1]"
          description={t("easeInOut")}
          ease={EASE_IN_OUT}
          reduce={Boolean(reduce)}
        />
      </div>
      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
        <TokenNote
          icon={MousePointer2}
          title="SPRING_PRESS"
          body={t("springPress")}
        />
        <TokenNote
          icon={CircleGauge}
          title="SPRING_LAYOUT"
          body={t("springLayout")}
        />
      </div>
    </div>
  );
}

function EasingTrack({
  label,
  value,
  description,
  ease,
  reduce,
}: {
  label: string;
  value: string;
  description: string;
  ease: readonly [number, number, number, number];
  reduce: boolean;
}) {
  return (
    <div className="bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-medium text-foreground">
          {label}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {value}
        </span>
      </div>
      <div className="mt-8 h-2 w-48 max-w-full rounded-full bg-card p-0.5">
        <motion.div
          initial={{ opacity: 0.5, transform: "translateX(0px)" }}
          animate={{
            opacity: 1,
            transform: reduce ? "translateX(0px)" : "translateX(176px)",
          }}
          transition={{ duration: reduce ? 0.18 : 0.9, ease }}
          className="size-1 rounded-full bg-foreground"
        />
      </div>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function TokenNote({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 bg-card p-5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
        <Icon className="size-3.5 text-foreground" aria-hidden="true" />
      </span>
      <div>
        <p className="font-mono text-xs text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const t = useTranslations("Pages.motionPatterns.recipes");
  const Icon = recipe.icon;

  return (
    <article className="py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(18rem,1.2fr)] lg:items-stretch lg:gap-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card">
              <Icon className="size-3.5 text-foreground" aria-hidden="true" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {t(`${recipe.key}.eyebrow`)}
            </span>
          </div>
          <h3 className="mt-5 text-lg font-medium text-foreground">
            {t(`${recipe.key}.title`)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t(`${recipe.key}.description`)}
          </p>
          <div className="mt-6 grid gap-3 text-xs leading-5">
            <Rule label={t("purpose")} value={t(`${recipe.key}.purpose`)} />
            <Rule label={t("avoid")} value={t(`${recipe.key}.avoid`)} />
          </div>
        </div>
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-border bg-card/60 p-6">
          <RecipeDemoView demo={recipe.demo} />
        </div>
      </div>
      <div className="mt-6">
        <CodeRecipe code={recipe.code} />
      </div>
    </article>
  );
}

function Rule({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3">
      <span className="font-mono uppercase text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

function CodeRecipe({
  code,
  alwaysOpen = false,
}: {
  code: string;
  alwaysOpen?: boolean;
}) {
  const t = useTranslations("Pages.motionPatterns.recipes");

  if (alwaysOpen) {
    return (
      <pre className="overflow-x-auto bg-card/60 p-5 font-mono text-xs leading-6 text-foreground sm:p-6">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <details className="group/code border-t border-border">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {t("viewRecipe")}
        <span className="font-mono text-muted-foreground transition-transform group-open/code:rotate-45">
          +
        </span>
      </summary>
      <pre className="overflow-x-auto border-t border-border bg-card p-5 font-mono text-xs leading-6 text-foreground">
        <code>{code}</code>
      </pre>
    </details>
  );
}

function RecipeDemoView({ demo }: { demo: RecipeDemo }) {
  const t = useTranslations("Pages.motionPatterns.demos");
  const reduce = useReducedMotion();
  const hoverCapable = useHoverCapable();
  const [replay, setReplay] = useState(0);
  const [iconActive, setIconActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"Preview" | "Code">("Preview");
  const tabsId = useId();

  if (demo === "press") {
    return (
      <motion.button
        type="button"
        whileTap={reduce ? undefined : { scale: 0.97 }}
        transition={SPRING_PRESS}
        className="h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {t("pressMe")}
      </motion.button>
    );
  }

  if (demo === "icon") {
    const active = iconActive && hoverCapable && !reduce;

    return (
      <button
        type="button"
        onMouseEnter={() => setIconActive(true)}
        onMouseLeave={() => setIconActive(false)}
        onFocus={() => setIconActive(true)}
        onBlur={() => setIconActive(false)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <motion.span
          animate={active ? { rotate: [0, 12, -8, 4, 0] } : { rotate: 0 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          style={{ transformOrigin: "top center" }}
        >
          <Bell className="size-4" aria-hidden="true" />
        </motion.span>
        {t("hoverBell")}
      </button>
    );
  }

  if (demo === "reveal") {
    return (
      <div className="flex w-full flex-col items-center">
        <ReplayButton
          onClick={() => setReplay((current) => current + 1)}
          reduce={Boolean(reduce)}
        />
        <motion.div
          key={replay}
          initial={{
            opacity: 0,
            transform: reduce ? "none" : "translateY(8px)",
            filter: reduce ? "none" : "blur(4px)",
          }}
          animate={{
            opacity: 1,
            transform: "translateY(0px)",
            filter: "blur(0px)",
          }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="mt-3 w-48 rounded-xl border border-border bg-card p-3"
        >
          <p className="text-sm font-medium text-foreground">{t("newSurface")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("readyBeforeFocus")}
          </p>
        </motion.div>
      </div>
    );
  }

  if (demo === "layout") {
    const transition = reduce ? { duration: 0 } : CONTINUITY_SPRING;

    return (
      <motion.div
        layout
        transition={transition}
        className="inline-flex"
      >
        <motion.button
          layout
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? t("collapsePanel") : t("expandPanel")}
          onClick={() => setExpanded((current) => !current)}
          whileTap={reduce ? undefined : { scale: 0.97 }}
          transition={transition}
          style={{ borderRadius: 9999 }}
          className="relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full border border-border bg-card p-1 pr-1 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <motion.span
            layout="position"
            transition={transition}
            className="inline-grid size-9 shrink-0 place-items-center rounded-full bg-background"
          >
            <PanelTopOpen className="size-4" aria-hidden="true" />
          </motion.span>
          <AnimatePresence mode="popLayout" initial={false}>
            {expanded ? (
              <motion.span
                key="continuity-label"
                layout
                variants={CONTINUITY_LABEL}
                initial={reduce ? { opacity: 0 } : "hidden"}
                animate={reduce ? { opacity: 1 } : "visible"}
                exit={reduce ? { opacity: 0 } : "exit"}
                transition={transition}
                className="relative inline-flex w-max items-center whitespace-nowrap pr-3"
              >
                {t("openPanel")}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-64 rounded-2xl bg-card p-2">
      <div role="tablist" aria-label={t("exampleViews")} className="grid grid-cols-2 gap-1">
        {(["Preview", "Code"] as const).map((item) => {
          const selected = tab === item;
          return (
            <button
              key={item}
              id={`${tabsId}-${item}-tab`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${tabsId}-panel`}
              onClick={() => setTab(item)}
              className={cn(
                "min-h-10 rounded-full px-3 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item === "Preview" ? t("preview") : t("code")}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          id={`${tabsId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-${tab}-tab`}
          initial={{
            opacity: 0,
            transform: reduce ? "none" : "translateY(4px)",
          }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          exit={{
            opacity: 0,
            transform: reduce ? "none" : "translateY(-4px)",
            transition: { duration: 0.12, ease: EASE_OUT },
          }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
          className="mt-2 rounded-lg bg-background p-4 text-sm text-foreground"
        >
          {tab === "Preview" ? t("livePreview") : t("copyReadySource")}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ReplayButton({
  onClick,
  reduce,
}: {
  onClick: () => void;
  reduce: boolean;
}) {
  const t = useTranslations("Pages.motionPatterns.demos");

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={SPRING_PRESS}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <RefreshCw className="size-3" aria-hidden="true" />
      {t("replay")}
    </motion.button>
  );
}
