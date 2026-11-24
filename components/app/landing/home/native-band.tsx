import { ArrowRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { InstallCommand } from "@/components/app/docs/install-command";
import { type NativePhone, NativePhones } from "@/components/app/landing/native-phones";
import nativeSlugs from "@/lib/native/slugs.json";
import { cn } from "@/lib/utils";
import { LandingButton } from "./landing-button";
import { NATIVE_COUNT } from "./landing-data";
import { SectionHeading } from "./section-heading";

/** beUI Native: a two-tone heading, then the install command over phones playing clips. */
export function NativeBand({ phones, className }: { phones: NativePhone[]; className?: string }) {
  const t = useTranslations("Landing.native");
  return (
    <section aria-labelledby="landing-native" className={cn("mx-auto max-w-6xl px-4", className)}>
      <SectionHeading
        id="landing-native"
        title={t("title")}
        muted={t("titleMuted", { count: NATIVE_COUNT })}
        action={
          <LandingButton href="/react-native" variant="outline">
            {t("browse")}
            <ArrowRight aria-hidden="true" />
          </LandingButton>
        }
      />
      <div className="overflow-hidden rounded-2xl bg-card">
        <div className="mx-auto max-w-md px-4 pt-6">
          <InstallCommand tool="beui-native" slugs={nativeSlugs} className="w-full" />
        </div>
        <NativePhones phones={phones} />
      </div>
    </section>
  );
}
