import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CodeBlock } from "@/components/app/docs/code-block";
import { InstallCommand } from "@/components/app/docs/install-command";
import { InstallTabs } from "@/components/app/docs/install-tabs";
import { NativePreview } from "@/components/app/docs/native/native-preview";
import { QrCode } from "@/components/app/docs/native/qr-code";
import {
  native,
  nativeInstallCommands,
  type NativeComponent,
  type NativeFile,
} from "@/lib/native";

const langFor = (file: string) => (file.endsWith(".tsx") ? "tsx" : "ts");

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

function Files({ files }: { files: NativeFile[] }) {
  return files.map((file) => (
    <CodeBlock
      key={file.path}
      code={file.content}
      lang={langFor(file.path)}
      filename={file.path}
    />
  ));
}

const external =
  "inline-flex items-center gap-1 text-foreground underline underline-offset-4";

/**
 * The React Native version of a component: a recording, a QR code that opens
 * it in Expo Go, and copy-paste install steps from beUI Native.
 */
export function NativePanel({ component }: { component: NativeComponent }) {

  return (
    <div className="mt-8 flex flex-col gap-12">
      <section id="native-preview" className="scroll-mt-24">
        <h2 className="sr-only">Preview</h2>
        <NativePreview
          clips={component.clips}
          title={component.title}
          expoGo={component.expoGo}
          sdk={native.expoGo.sdk}
          qr={
            <QrCode
              value={component.expoGo}
              label={`QR code that opens ${component.title} in Expo Go`}
              className="w-full"
            />
          }
        />
      </section>

      <section
        id="native-install"
        className="scroll-mt-24 border-t border-border pt-8"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold text-foreground">Install</h2>
          <a
            href={component.repository}
            target="_blank"
            rel="noreferrer noopener"
            className={external}
          >
            Source on GitHub
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          It works in Expo and in bare React Native. New to beUI Native?{" "}
          <Link
            href="/docs/native-setup"
            className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Set up your app first
          </Link>
          .
        </p>
        <div className="mt-6">
          <InstallTabs
            cli={
              <div className="flex flex-col gap-3">
                <InstallCommand tool="beui-native" slug={component.slug} />
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Copies the component and the shared files it needs into{" "}
                  <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
                    src/
                  </code>
                  , adds the theme tokens if they&apos;re missing, and installs
                  its libraries. Files you&apos;ve changed are kept.
                </p>
              </div>
            }
            manual={<ManualSteps component={component} />}
          />
        </div>
      </section>
    </div>
  );
}

/** Copy-paste install: libraries, theme, shared files, then the component. */
function ManualSteps({ component }: { component: NativeComponent }) {
  const commands = nativeInstallCommands(component);
  const gestures = component.libraries.includes("react-native-gesture-handler");
  let step = 0;

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Keep the folder layout, since the component imports the shared files by
        relative path.
      </p>
      {commands.length > 0 ? (
        <Step number={++step} title="Install the libraries">
          <CodeBlock code={commands.join("\n")} lang="bash" />
          {gestures ? (
            <p className="text-sm text-muted-foreground">
              Wrap your app in{" "}
              <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
                GestureHandlerRootView
              </code>{" "}
              if it isn't already.
            </p>
          ) : null}
        </Step>
      ) : null}
      <Step number={++step} title="Add the theme tokens">
        <p className="text-sm text-muted-foreground">
          Once per app. Import it from the CSS file Uniwind reads, after
          Tailwind and Uniwind, and change the values to match your brand.
        </p>
        <CodeBlock
          code={native.theme.content}
          lang="css"
          filename={native.theme.path}
        />
      </Step>
      {component.shared.length > 0 ? (
        <Step number={++step} title="Copy the shared files">
          <Files files={component.shared} />
        </Step>
      ) : null}
      <Step number={++step} title="Copy the component">
        <Files files={component.files} />
      </Step>
    </div>
  );
}
