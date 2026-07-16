import type { Testimonial } from "@/components/app/landing/testimonials-data";
import { cn } from "@/lib/utils";

function VerifiedBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="Verified account"
      className="h-[1.05em] w-[1.05em] shrink-0 text-[#1d9bf0]"
      fill="currentColor"
    >
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.68.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.66-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.91.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
    </svg>
  );
}

export function TestimonialCard({
  testimonial,
  compact = false,
}: {
  testimonial: Testimonial;
  compact?: boolean;
}) {
  // Swap Twitter's 48px `_normal` avatar for the crisper 73px `_bigger`.
  const avatar = testimonial.user.avatar.replace("_normal", "_bigger");

  return (
    <a
      href={
        testimonial.url ??
        `https://x.com/${testimonial.user.username}/status/${testimonial.id}`
      }
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group block rounded-3xl border border-border bg-card transition-colors duration-200 hover:border-border-strong",
        // No forced height: a card sizes to its own tweet, so a short one-liner
        // doesn't inherit a tall neighbor's height and sit with a dead gap.
        compact ? "w-[330px] whitespace-normal p-4" : "p-5",
      )}
    >
      <div className="flex items-center gap-3">
        {/* biome-ignore lint/performance/noImgElement: external Twitter avatar, not worth a next/image remotePatterns entry */}
        <img
          src={avatar}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className={cn(
            "shrink-0 rounded-full object-cover",
            compact ? "h-9 w-9" : "h-10 w-10",
          )}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="truncate font-medium text-foreground">
              {testimonial.user.name}
            </span>
            {testimonial.user.verified ? <VerifiedBadge /> : null}
          </div>
          <span className="block truncate text-sm text-muted-foreground">
            @{testimonial.user.username}
          </span>
        </div>
      </div>

      <p
        className={cn(
          "mt-3 whitespace-pre-wrap text-foreground",
          compact
            ? "line-clamp-4 text-sm leading-relaxed"
            : "mt-4 text-[15px] leading-relaxed",
        )}
      >
        {testimonial.text}
      </p>
    </a>
  );
}
