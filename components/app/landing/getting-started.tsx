import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { InstallCommand } from "@/components/app/docs/install-command";

export function GettingStarted() {
  return (
    <section
      aria-labelledby="landing-install"
      className="mx-auto max-w-7xl px-4 py-16 sm:py-24"
    >
      <div className="grid items-center gap-10 border-y border-border py-12 sm:py-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-sm text-muted-foreground">
            From the library to your codebase
          </p>
          <h2
            id="landing-install"
            className="mt-4 text-balance font-display text-3xl font-medium tracking-tight sm:text-4xl"
          >
            Find it. Add it. Make it yours.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
            Install with the shadcn CLI or copy the source. You get real React
            files to edit, with shared motion tokens and styles that fit your
            theme.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground">
            {["MIT licensed", "TypeScript", "Light & dark"].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="size-3.5 text-[#0285f7]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <p className="mb-4 text-sm font-medium text-foreground">
            Start with a better button.
          </p>
          <InstallCommand slug="button" />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Prefer building with a coding agent?</span>
            <Link
              href="/docs/ai-agents"
              className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Connect your agent
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
