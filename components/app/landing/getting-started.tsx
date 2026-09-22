import { InstallCommand } from "@/components/app/docs/install-command";

export function GettingStarted() {
  return (
    <section
      aria-labelledby="landing-install"
      className="mx-auto max-w-7xl px-4 pb-16 sm:pb-20"
    >
      <div className="mx-auto max-w-2xl">
        <h2
          id="landing-install"
          className="mb-5 text-center text-sm font-normal text-muted-foreground"
        >
          Built on Framer Motion. Distributed via shadcn.
        </h2>
        <InstallCommand />
      </div>
    </section>
  );
}
