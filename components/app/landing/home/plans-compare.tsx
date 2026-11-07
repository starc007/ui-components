import { ArrowRight, ArrowUpRight, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingButton } from "./landing-button";
import { PRO_URL } from "./landing-data";
import { SectionTitle } from "./section-title";

const ROWS: { label: string; free: boolean; pro: boolean }[] = [
  { label: "Components, blocks, charts and AI interfaces", free: true, pro: true },
  { label: "shadcn registry and copy-paste source", free: true, pro: true },
  { label: "React Native components (beUI Native)", free: true, pro: true },
  { label: "MIT license, commercial use", free: true, pro: true },
  { label: "350+ premium blocks and animated components", free: false, pro: true },
  { label: "60+ React Native blocks and screens (Pro Mobile)", free: false, pro: true },
  { label: "Full landing-page templates (Lifetime)", free: false, pro: true },
  { label: "Animated illustrations (Lifetime)", free: false, pro: true },
  { label: "Agent Skill, MCP and one-command installs", free: false, pro: true },
  { label: "Unlimited personal and client projects", free: false, pro: true },
];

function Mark({ on, pro }: { on: boolean; pro?: boolean }) {
  return on ? (
    <Check
      aria-label="Included"
      className={cn("size-4", pro ? "text-primary" : "text-foreground")}
    />
  ) : (
    <Minus aria-label="Not included" className="size-4 text-muted-foreground/50" />
  );
}

/** Free and Pro as one comparison table instead of two marketing cards. */
export function PlansCompare({
  placement,
  className,
}: {
  placement: string;
  className?: string;
}) {
  return (
    <section aria-labelledby="landing-plans" className={cn("mx-auto max-w-6xl px-4", className)}>
      <SectionTitle id="landing-plans" label="Free and Pro" title="Start free. Go further with Pro." />
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-[13px]">
          <caption className="sr-only">What beUI and beUI Pro include</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 font-normal text-muted-foreground">
                <span className="sr-only">Feature</span>
              </th>
              <th scope="col" className="w-24 px-4 py-3 font-medium sm:w-40">
                beUI
                <span className="block text-xs font-normal text-muted-foreground">Free</span>
              </th>
              <th scope="col" className="w-24 px-4 py-3 font-medium text-primary sm:w-40">
                beUI Pro
                <span className="block text-xs font-normal text-muted-foreground">Lifetime</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-2.5 font-normal text-foreground">
                  {row.label}
                </th>
                <td className="px-4 py-2.5">
                  <Mark on={row.free} />
                </td>
                <td className="px-4 py-2.5">
                  <Mark on={row.pro} pro />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td className="px-4 py-3" />
              <td className="px-4 py-3">
                <LandingButton href="/components/motion" variant="outline" className="px-3">
                  Browse
                  <ArrowRight aria-hidden="true" />
                </LandingButton>
              </td>
              <td className="px-4 py-3">
                <LandingButton
                  href={PRO_URL(placement)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3"
                >
                  Get Pro
                  <ArrowUpRight aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </LandingButton>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
