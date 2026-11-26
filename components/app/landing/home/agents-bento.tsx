"use client";

import { ArrowRight, Check, ChevronDown, Copy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "use-intl";
import type { ReactNode } from "react";
import { ClaudeIcon, OpenAIIcon, V0Icon } from "@/components/app/brand-icons";
import { CopyButton } from "@/components/app/docs/copy-button";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { LandingButton } from "./landing-button";
import { SectionHeading } from "./section-heading";

const SKILL_COMMAND = "npx skills add starc007/ui-components --skill beui";
const STEP_DELAY = 0.14;

/**
 * Lines that appear one after another the first time the block scrolls into
 * view, like output arriving. Reduced motion shows them at once.
 */
function Steps({ children, className }: { children: ReactNode[]; className?: string }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <ol className={className}>
      {children.map((child, index) => (
        <motion.li
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed script whose order never changes.
          key={index}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={{ duration: 0.22, ease: EASE_OUT, delay: index * STEP_DELAY }}
        >
          {child}
        </motion.li>
      ))}
    </ol>
  );
}

function Tile({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    // min-w-0 lets long code lines truncate instead of widening the column.
    <article className={cn("flex min-w-0 flex-col rounded-2xl bg-card p-2", className)}>
      <div className="px-3 pt-3 pb-4">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>
      </div>
      {/* Concentric with the tile: 16px corners, 8px inset, 8px here. */}
      <div className="mt-auto overflow-hidden rounded-lg bg-background p-4">{children}</div>
    </article>
  );
}

function ToolCall({ name, args, result }: { name: string; args: string; result: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2 font-mono text-xs leading-5">
      <p className="truncate">
        <span className="text-muted-foreground">beui · </span>
        <span className="text-foreground">{name}</span>
        <span className="text-muted-foreground">({args})</span>
      </p>
      <p className="truncate text-muted-foreground">→ {result}</p>
    </div>
  );
}

/**
 * What beUI gives coding agents, as four tiles: the MCP server in a mock
 * chat, the shadcn install, the Agent Skill and the Markdown docs.
 */
export function AgentsBento({ className }: { className?: string }) {
  const t = useTranslations("Landing.agents");
  const check = <Check aria-hidden="true" className="inline size-3.5 text-(--color-success)" />;

  return (
    <section aria-labelledby="landing-agents" className={cn("mx-auto max-w-6xl px-4", className)}>
      <SectionHeading
        id="landing-agents"
        title={t("title")}
        muted={t("titleMuted")}
        action={
          <LandingButton href="/docs/ai-agents" variant="outline">
            {t("guide")}
            <ArrowRight aria-hidden="true" />
          </LandingButton>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Tile title={t("mcp.title")} description={t("mcp.description")} className="lg:col-span-2">
          <Steps className="flex flex-col gap-2.5">
            {[
              <p
                key="prompt"
                className="ml-auto w-fit max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-sm text-foreground"
              >
                {t("mcp.prompt")}
              </p>,
              <ToolCall
                key="search"
                name="search_components"
                args={`"toast stack"`}
                result="animated-toast-stack"
              />,
              <ToolCall
                key="install"
                name="get_install_command"
                args={`"animated-toast-stack"`}
                result="npx shadcn@latest add @beui/animated-toast-stack"
              />,
              <div key="reply" className="flex items-start gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                  <ClaudeIcon className="size-3.5" />
                </span>
                <p className="pt-1 text-sm text-foreground">{t("mcp.reply")}</p>
              </div>,
            ]}
          </Steps>
        </Tile>

        <Tile title={t("cli.title")} description={t("cli.description")}>
          <Steps className="font-mono text-xs leading-6 text-muted-foreground">
            {[
              <p key="cmd" className="truncate text-foreground">
                <span className="text-muted-foreground">$ </span>
                npx shadcn@latest add @beui/bookshelf
              </p>,
              <p key="registry">{check} Checking registry.</p>,
              <p key="deps">{check} Installing dependencies.</p>,
              <div key="files">
                <p>{check} Created 9 files:</p>
                <p className="truncate pl-4">- components/motion/bookshelf.tsx</p>
                <p className="truncate pl-4">- lib/book-sounds.ts</p>
                <p className="pl-4">- and 7 more</p>
              </div>,
            ]}
          </Steps>
        </Tile>

        <Tile title={t("skill.title")} description={t("skill.description")}>
          {/* The command wraps rather than truncates: a cut-off command can't be read back. */}
          <div className="flex items-start gap-2 rounded-lg border border-border py-1.5 pr-1.5 pl-3">
            <code className="min-w-0 flex-1 py-1 font-mono text-xs leading-5 break-words text-foreground">
              {SKILL_COMMAND}
            </code>
            <CopyButton text={SKILL_COMMAND} eventName="copy_skill_command" eventLabel="landing" />
          </div>
        </Tile>

        <Tile
          title={t("docs.title")}
          description={t("docs.description")}
          className="lg:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <Steps className="min-w-0 font-mono text-xs leading-6 text-muted-foreground">
              {[
                <p key="h1" className="text-foreground">
                  # beUI
                </p>,
                <p key="tag">&gt; Animated components for React and Next.js.</p>,
                <p key="h2" className="pt-2 text-foreground">
                  ## Components
                </p>,
                <p key="a" className="truncate">
                  - [Bookshelf](https://beui.dev/components/motion/bookshelf.md)
                </p>,
                <p key="b" className="truncate">
                  - [Dropdown Menu](https://beui.dev/components/motion/dropdown-menu.md)
                </p>,
              ]}
            </Steps>
            {/* A picture of the Copy Page menu on every docs page, not a control. */}
            <div aria-hidden="true" className="w-48 rounded-2xl border border-border bg-background p-1.5 text-xs">
              <div className="mb-1.5 flex items-center justify-between rounded-full bg-muted px-3 py-1.5 font-medium text-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Copy className="size-3.5" />
                  {t("docs.copyPage")}
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </div>
              {[
                { app: "Claude", icon: ClaudeIcon },
                { app: "ChatGPT", icon: OpenAIIcon },
                { app: "v0", icon: V0Icon },
              ].map(({ app, icon: Icon }) => (
                <p key={app} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-foreground">
                  <Icon className={cn("size-3.5 text-muted-foreground", app === "v0" && "w-5")} />
                  {t("docs.openIn", { app })}
                </p>
              ))}
            </div>
          </div>
        </Tile>
      </div>
    </section>
  );
}
