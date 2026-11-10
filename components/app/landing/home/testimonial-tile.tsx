import { useTranslations } from "use-intl";
import type { Testimonial } from "@/components/app/landing/testimonials-data";
import { TestimonialAvatar } from "./testimonial-avatar";

function VerifiedBadge({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label={label}
      className="size-3.5 shrink-0 text-[#1d9bf0]"
      fill="currentColor"
    >
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.68.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.66-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.91.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
    </svg>
  );
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Replies open with the handles they answer; the quote reads better without them. */
export function quoteText(text: string) {
  return text.replace(/^(@\w+\s+)+/, "");
}

/** One post on X as a quiet bordered quote: words first, author underneath. */
export function TestimonialTile({ testimonial }: { testimonial: Testimonial }) {
  const t = useTranslations("Landing.testimonials");
  const href =
    testimonial.url ?? `https://x.com/${testimonial.user.username}/status/${testimonial.id}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group relative block rounded-2xl border border-border bg-background p-4 transition-colors duration-200 ease-out hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="absolute top-4 right-4 text-muted-foreground/60 transition-colors group-hover:text-foreground">
        <XLogo />
      </span>
      <p className="whitespace-pre-wrap pr-5 text-pretty text-[13px] leading-5 text-foreground">
        {quoteText(testimonial.text)}
      </p>
      <div className="mt-4 flex items-center gap-2.5">
        <TestimonialAvatar src={testimonial.user.avatar} name={testimonial.user.name} className="size-7" />
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1">
            <span className="truncate text-xs font-medium text-foreground">
              {testimonial.user.name}
            </span>
            {testimonial.user.verified ? <VerifiedBadge label={t("verified")} /> : null}
          </div>
          <span className="block truncate text-xs text-muted-foreground">
            @{testimonial.user.username}
          </span>
        </div>
      </div>
      <span className="sr-only"> {t("opensPost")}</span>
    </a>
  );
}
