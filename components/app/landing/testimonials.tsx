import type { Tweet } from "react-tweet/api";
import { getTweet } from "react-tweet/api";
import { TestimonialCard } from "@/components/app/landing/testimonial-card";
import { Marquee } from "@/components/motion/marquee";

// Public tweets shown as social proof. IDs only — the content is pulled from
// Twitter's syndication API on the server and rendered statically, so no
// async component streams into the client (which trips a React 19 / Next 15
// Flight bug: "chunk.reason.enqueueModel is not a function").
const TWEET_IDS = [
  "2070915664668512304",
  "2073486052665537002",
  "2073135185370227162",
  "2072978320036348221",
  "2070129442157191185",
  "2073494103153586236",
  "2071327003790184684",
  "2069456887184318562",
  "2066804142719275062",
  "2071206392925765751",
  "2069415701874720806",
  "2073188569506587028",
  "2069333890506936655",
  "2071800087940870242",
  "2069108073839435853",
  "2071704269816811735",
  "2069459958857650245",
  "2071569532796256411",
];

export async function Testimonials() {
  const tweets = await Promise.all(
    TWEET_IDS.map(async (id) => {
      try {
        return await getTweet(id);
      } catch {
        return undefined;
      }
    }),
  );
  const found = tweets.filter((t): t is Tweet => t != null);
  if (found.length === 0) return null;

  // Split into two rows that scroll in opposite directions.
  const mid = Math.ceil(found.length / 2);
  const rowOne = found.slice(0, mid);
  const rowTwo = found.slice(mid);

  return (
    <section className="pb-16">
      <div className="mx-auto mb-8 max-w-7xl border-t border-border px-4 pt-12">
        <p className="font-pixel text-xs font-medium uppercase text-muted-foreground">
          Testimonials
        </p>
        <h2 className="mt-2 font-pixel text-3xl font-medium leading-tight text-foreground md:text-4xl">
          Loved by builders.
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <Marquee direction="left" speed={60} gap="1rem" fade>
          {rowOne.map((tweet) => (
            <TestimonialCard key={tweet.id_str} tweet={tweet} compact />
          ))}
        </Marquee>
        <Marquee direction="right" speed={60} gap="1rem" fade>
          {rowTwo.map((tweet) => (
            <TestimonialCard key={tweet.id_str} tweet={tweet} compact />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
