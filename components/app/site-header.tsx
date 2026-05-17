import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-bg)/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-(--color-fg)">
          <span className="inline-block h-5 w-5 rounded-md border border-(--color-border-strong) bg-(--color-fg)" />
          beUI <span className="text-(--color-fg-muted) font-normal">v2</span>
        </Link>
      </div>
    </header>
  );
}
