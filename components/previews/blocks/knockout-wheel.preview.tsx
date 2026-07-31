"use client";

import { KnockoutWheel, ROUNDS } from "@/components/motion/knockout-wheel";

// `ROUNDS` is the sample 32-team cup that ships with the component, and it's the
// same array the knockout bracket takes, so one dataset feeds both fixture
// styles. Any other single-elimination tournament renders the same way. Build
// your own `Round[]`, widest round first, each round holding half the matches of
// the one before it, and pass it in:
//
//   const rounds: Round[] = [
//     {
//       name: "Quarter-finals",
//       matches: [
//         {
//           id: "qf-1",
//           home: { team: { name: "Cloud9", logo: "/logos/c9.svg" }, score: 2 },
//           away: { team: { name: "T1", logo: "/logos/t1.svg" }, score: 1 },
//           winner: "home",
//         },
//         // qf-2, qf-3, qf-4 …
//       ],
//     },
//     { name: "Semi-finals", matches: [/* fed by qf 1+2 and qf 3+4 */] },
//     { name: "Grand final", matches: [/* the one final */] },
//   ];
//
// The wheel grows a ring per round and holds a 32rem stage at every size, so it
// pans on a phone rather than shrinking its marks. A team carries a `logo` URL,
// an ISO country `code` for a flag, or neither, in which case its initials stand
// in. `initialRound` drops the outer rounds.
export function KnockoutWheelPreview() {
  return (
    <div className="w-full py-8">
      <KnockoutWheel rounds={ROUNDS} />
    </div>
  );
}
