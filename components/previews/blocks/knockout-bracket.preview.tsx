"use client";

import {
  KnockoutBracket,
  ROUNDS,
  THIRD_PLACE,
} from "@/components/motion/knockout-bracket";

// `ROUNDS` is the sample World Cup draw that ships with the component. Any other
// single-elimination tournament renders the same way. Build your own `Round[]`,
// widest round first, each round holding half the matches of the one before it,
// and pass it in:
//
//   const rounds: Round[] = [
//     {
//       name: "Quarter-finals",
//       matches: [
//         {
//           id: "qf-1",
//           date: "Sat, 14 Mar",
//           home: { team: { name: "Cloud9", logo: "/logos/c9.svg" }, score: 2 },
//           away: { team: { name: "T1", logo: "/logos/t1.svg" }, score: 1 },
//           winner: "home",
//           badge: "BO3",
//         },
//         // qf-2, qf-3, qf-4 …
//       ],
//     },
//     { name: "Semi-finals", matches: [/* fed by qf 1+2 and qf 3+4 */] },
//     { name: "Grand final", matches: [/* the one final */] },
//   ];
//
// A team carries a `logo` URL, an ISO country `code` for a flag, or neither, in
// which case its initials stand in. `date`, `time`, `status` and `badge` are all
// optional. `thirdPlaceLabel` renames the play-off when a tournament calls it
// something else ("Bronze match").
export function KnockoutBracketPreview() {
  return (
    <div className="w-full py-8">
      <KnockoutBracket rounds={ROUNDS} thirdPlace={THIRD_PLACE} />
    </div>
  );
}
