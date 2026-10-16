import { ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";
import { InstallCommand } from "@/components/app/docs/install-command";
import {
  type NativePhone,
  NativePhones,
} from "@/components/app/landing/native-phones";
import { nativeComponentPath } from "@/lib/component-paths";
import { native } from "@/lib/native";
import nativeSlugs from "@/lib/native/slugs.json";
import summary from "@/lib/native/summary.json";

// Components whose clips show the most in a few seconds. Narrow screens show
// the first two, tablets three.
const FEATURED = ["tabs", "color-picker", "alert", "swipeable-list"];

/** The pastel waves of the announcement strip, still, behind the panel. */
function Waves() {
  const gradient = "landing-native-waves";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 400"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[24rem] w-full sm:h-[30rem] opacity-50 dark:opacity-[0.07]"
    >
      <defs>
        <linearGradient id={gradient} x1="0" x2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="25%" stopColor="#d1fae5" />
          <stop offset="50%" stopColor="#fef3c7" />
          <stop offset="75%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#fce7f3" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradient})`} d="M0 120 Q360 0 720 120 T1440 120 V400 H0Z" />
      <path fill={`url(#${gradient})`} opacity="0.6" d="M0 200 Q360 300 720 200 T1440 200 V400 H0Z" />
    </svg>
  );
}

/** Landing panel introducing beUI Native: pitch, install, and phones. */
export function NativeShowcase() {
  const phones: NativePhone[] = FEATURED.flatMap((slug) => {
    const component = native.components.find((c) => c.slug === slug);
    return component
      ? [{ slug, title: component.title, href: nativeComponentPath(slug), clips: component.clips }]
      : [];
  });

  return (
    <section
      aria-labelledby="landing-native"
      className="pb-16 sm:pb-20"
    >
      {/* A full-width band; its content keeps the page's column. */}
      <div className="relative isolate overflow-hidden bg-card">
        <Waves />
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:pt-16 lg:pt-20">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
              <Smartphone aria-hidden="true" className="size-3.5" />
              beUI Native
            </p>
            <h2
              id="landing-native"
              className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight text-foreground md:text-5xl"
            >
              Now on React Native
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
              {summary.variants} components rebuilt for touch with Reanimated,
              Gesture Handler and Uniwind. The same motion language as beUI,
              designed for fingers.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/react-native"
                className="group inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                Browse components
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </Link>
              {/* Expo Go links only open on a phone, so desktops don't get one. */}
              <a
                href={native.expoGo.url}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 lg:hidden"
              >
                <Smartphone aria-hidden="true" className="size-3.5" />
                Open in Expo Go
              </a>
            </div>
            <InstallCommand
              tool="beui-native"
              slugs={nativeSlugs}
              className="mt-7"
            />
          </div>
        </div>
        <div className="mx-auto max-w-7xl">
          <NativePhones phones={phones} />
        </div>
      </div>
    </section>
  );
}
