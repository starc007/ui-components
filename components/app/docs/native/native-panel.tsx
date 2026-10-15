import { ArrowUpRight, Smartphone } from "lucide-react";
import { CodeBlock } from "@/components/app/docs/code-block";
import { NativeClip } from "@/components/app/docs/native/native-clip";
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
  const commands = nativeInstallCommands(component);
  const gestures = component.libraries.includes("react-native-gesture-handler");
  let step = 0;

  return (
    <div className="mt-8 flex flex-col gap-12">
      <section
        id="native-preview"
        className="grid scroll-mt-24 grid-cols-1 items-center gap-8 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-12"
      >
        <h2 className="sr-only">Preview</h2>
        <NativeClip
          clips={component.clips}
          title={component.title}
          className="mx-auto max-w-[15rem]"
        />
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Try it on your phone
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Scan with your camera to open {component.title} in the beUI
              Native showcase. You need{" "}
              <a
                href="https://expo.dev/go"
                target="_blank"
                rel="noreferrer noopener"
                className={external}
              >
                Expo Go
              </a>{" "}
              for SDK {native.expoGo.sdk}.
            </p>
          </div>
          <QrCode
            value={component.expoGo}
            label={`QR code that opens ${component.title} in Expo Go`}
            className="h-40 w-40"
          />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {/* Opens Expo Go when the page is read on the phone itself. */}
            <a href={component.expoGo} className={external}>
              <Smartphone className="h-3.5 w-3.5" />
              Open in Expo Go
            </a>
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
        </div>
      </section>

      <section
        id="native-install"
        className="scroll-mt-24 border-t border-border pt-8"
      >
        <h2 className="text-sm font-semibold text-foreground">Install</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Copy the files into your app and keep their folder layout, since the
          component imports the shared files by relative path. It works in Expo
          and in bare React Native.
        </p>
        <div className="mt-6 flex flex-col gap-8">
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
      </section>
    </div>
  );
}
