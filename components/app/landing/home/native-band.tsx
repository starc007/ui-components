import { ArrowRight } from "lucide-react";
import { InstallCommand } from "@/components/app/docs/install-command";
import { NativePhones } from "@/components/app/landing/native-phones";
import nativeSlugs from "@/lib/native/slugs.json";
import { cn } from "@/lib/utils";
import { LandingButton } from "./landing-button";
import { NATIVE_COUNT, nativePhones } from "./landing-data";

const FEATURED = ["tabs", "color-picker", "alert", "swipeable-list"];

/** beUI Native in a bordered panel: pitch and install on the left, phones below. */
export function NativeBand({ className }: { className?: string }) {
  return (
    <section aria-labelledby="landing-native" className={cn("mx-auto max-w-6xl px-4", className)}>
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-md">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              beUI Native
            </p>
            <h2
              id="landing-native"
              className="mt-2 text-2xl font-medium tracking-tight text-foreground md:text-[1.75rem]"
            >
              Same motion, on React Native
            </h2>
            <p className="mt-3 text-pretty text-sm leading-6 text-muted-foreground">
              {NATIVE_COUNT} components rebuilt for touch with Reanimated, Gesture Handler and
              Uniwind.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:w-[26rem]">
            <InstallCommand tool="beui-native" slugs={nativeSlugs} className="w-full" />
            <LandingButton href="/react-native" variant="outline" className="self-start">
              Browse native components
              <ArrowRight aria-hidden="true" />
            </LandingButton>
          </div>
        </div>
        <div className="-mt-6 border-t border-border bg-card">
          <NativePhones phones={nativePhones(FEATURED)} />
        </div>
      </div>
    </section>
  );
}
