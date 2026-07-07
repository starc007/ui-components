import Link from "next/link";

export function KeepInMind() {
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-sm font-semibold text-foreground">Keep in mind</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Some components on this site are inspired by or recreated from existing
        work across the web. I&apos;m not here to take credit; just to learn,
        experiment, and sometimes push things a bit further. If something looks
        familiar and I forgot to mention you,{" "}
        <Link
          href="https://x.com/saurra3h"
          target="_blank"
          rel="noreferrer noopener"
          className="text-foreground underline-offset-2 hover:underline"
        >
          reach out
        </Link>{" "}
        and I&apos;ll fix that right away.
      </p>
    </section>
  );
}
