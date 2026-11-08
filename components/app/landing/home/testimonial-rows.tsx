import { TESTIMONIALS } from "@/components/app/landing/testimonials-data";
import { Marquee } from "@/components/motion/marquee";
import { cn } from "@/lib/utils";
import { TestimonialAvatar } from "./testimonial-avatar";
import { TestimonialTile } from "./testimonial-tile";

// Four columns drifting in alternating directions at slightly different
// paces, so the wall never scrolls in lockstep. Narrow screens show only
// the first one or two columns.
const COLUMNS = [
  { direction: "up", speed: 46, show: "" },
  { direction: "down", speed: 54, show: "hidden sm:block" },
  { direction: "up", speed: 50, show: "hidden lg:block" },
  { direction: "down", speed: 58, show: "hidden xl:block" },
] as const;

const BUILDER_COUNT = "200k+";

/** Deal posts round-robin so long and short quotes mix in every column. */
function columnsOf<T>(items: readonly T[], count: number) {
  return Array.from({ length: count }, (_, column) =>
    items.filter((_, index) => index % count === column),
  );
}

/**
 * A wall of posts from X: a small header with the authors' avatars, then
 * slow vertical marquees inside a fixed-height frame that fades at both
 * edges. Hovering a column pauses it; reduced motion holds every column still.
 */
export function TestimonialRows({ className }: { className?: string }) {
  const columns = columnsOf(TESTIMONIALS, COLUMNS.length);
  const faces = TESTIMONIALS.slice(0, 7);

  return (
    <section aria-labelledby="landing-testimonials" className={cn("mx-auto max-w-6xl px-4", className)}>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="inline-flex h-9 items-center gap-2.5 rounded-full border border-border py-1 pr-3.5 pl-1">
          {/* A few spare faces: dead photos drop out instead of showing initials. */}
          <div className="flex -space-x-2">
            {faces.map((testimonial) => (
              <TestimonialAvatar
                key={testimonial.id}
                src={testimonial.user.avatar}
                name={testimonial.user.name}
                fallback="none"
                className="size-7 ring-2 ring-background"
              />
            ))}
          </div>
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{BUILDER_COUNT}</span> builders use
            beUI
          </p>
        </div>
        <h2
          id="landing-testimonials"
          className="mt-4 text-2xl font-medium tracking-tight text-foreground md:text-[1.75rem]"
        >
          Loved by builders
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          What people say about beUI on X.
        </p>
      </div>

      <div className="grid h-[34rem] grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {COLUMNS.map((column, index) => (
          <div key={column.direction + column.speed} className={cn("h-full min-h-0", column.show)}>
            <Marquee
              direction={column.direction}
              speed={column.speed}
              gap="0.75rem"
              fade={false}
              // The tracks center their items, which shrink-wraps each card
              // to its text; stretch them so every card fills the column.
              className="h-full [&>div]:items-stretch [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]"
            >
              {(columns[index] ?? []).map((testimonial) => (
                <TestimonialTile key={testimonial.id} testimonial={testimonial} />
              ))}
            </Marquee>
          </div>
        ))}
      </div>
    </section>
  );
}
