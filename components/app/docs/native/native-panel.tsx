import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { CodeBlock } from "@/components/app/docs/code-block";
import { InstallCommand } from "@/components/app/docs/install-command";
import { InstallTabs } from "@/components/app/docs/install-tabs";
import { NativePreview } from "@/components/app/docs/native/native-preview";
import { Link } from "@/lib/navigation";
import type { HighlightedCode } from "@/lib/highlight";
import type { NativeComponent } from "@/lib/native";

/** The fields of a native component the panel shows. */
export type NativePanelComponent = Pick<
  NativeComponent,
  "slug" | "title" | "clips" | "repository"
>;

/**
 * The manual install steps' code, highlighted in the page's server function:
 * library install commands (null when none), the theme file, shared files and
 * the component's own files. `gestures` adds the gesture root note.
 */
export type NativePanelCode = {
  libraries: HighlightedCode | null;
  gestures: boolean;
  theme: HighlightedCode;
  shared: HighlightedCode[];
  files: HighlightedCode[];
};

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/5 font-mono text-[11px] text-muted-foreground">
          {number}
        </span>
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Files({ files }: { files: HighlightedCode[] }) {
  return files.map((file) => <CodeBlock key={file.filename} {...file} />);
}

const code = (chunks: React.ReactNode) => (
  <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
    {chunks}
  </code>
);

const external =
  "inline-flex items-center gap-1 text-foreground underline underline-offset-4";

/**
 * The React Native version of a component: a recording and copy-paste install
 * steps from beUI Native.
 */
export function NativePanel({
  component,
  code: highlighted,
}: {
  component: NativePanelComponent;
  code: NativePanelCode;
}) {
  const t = useTranslations("Native.panel");

  return (
    <div className="mt-8 flex flex-col gap-12">
      <section id="native-preview" className="scroll-mt-24">
        <h2 className="sr-only">{t("preview")}</h2>
        <NativePreview clips={component.clips} title={component.title} />
      </section>

      <section
        id="native-install"
        className="scroll-mt-24 border-t border-border pt-8"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold text-foreground">{t("install")}</h2>
          <a
            href={component.repository}
            target="_blank"
            rel="noreferrer noopener"
            className={external}
          >
            {t("source")}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t.rich("worksIn", {
            link: (chunks) => (
              <Link
                href="/docs/native-setup"
                className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
        <div className="mt-6">
          <InstallTabs
            cli={
              <div className="flex flex-col gap-3">
                <InstallCommand tool="beui-native" slug={component.slug} />
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {t.rich("cli", { code })}
                </p>
              </div>
            }
            manual={<ManualSteps code={highlighted} />}
          />
        </div>
      </section>
    </div>
  );
}

/** Copy-paste install: libraries, theme, shared files, then the component. */
function ManualSteps({ code: highlighted }: { code: NativePanelCode }) {
  const t = useTranslations("Native.panel");
  let step = 0;

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-sm text-muted-foreground">
        {t("manualIntro")}
      </p>
      {highlighted.libraries ? (
        <Step number={++step} title={t("stepLibraries")}>
          <CodeBlock {...highlighted.libraries} />
          {highlighted.gestures ? (
            <p className="text-sm text-muted-foreground">
              {t.rich("gestureRoot", { code })}
            </p>
          ) : null}
        </Step>
      ) : null}
      <Step number={++step} title={t("stepTheme")}>
        <p className="text-sm text-muted-foreground">
          {t("themeBody")}
        </p>
        <CodeBlock {...highlighted.theme} />
      </Step>
      {highlighted.shared.length > 0 ? (
        <Step number={++step} title={t("stepShared")}>
          <Files files={highlighted.shared} />
        </Step>
      ) : null}
      <Step number={++step} title={t("stepComponent")}>
        <Files files={highlighted.files} />
      </Step>
    </div>
  );
}
