"use client";

import { useState } from "react";
import { PollVote } from "@/components/motion/poll-vote";
import { useAutoplay } from "./autoplay";

const OPTIONS = [
  { id: "springs", label: "Springs", votes: 42 },
  { id: "curves", label: "Easing curves", votes: 27 },
  { id: "both", label: "Both, it depends", votes: 31 },
];
// Vote, clear, vote for the next one.
const STEPS = [null, "springs", null, "both", null, "curves"];

export function PollVotePreview() {
  const [step, setStep] = useState(0);
  const stage = useAutoplay(() => setStep((value) => (value + 1) % STEPS.length), 1800);

  return (
    <div {...stage} className="w-72">
      <PollVote
        options={OPTIONS}
        value={STEPS[step]}
        onValueChange={(next) => setStep(Math.max(0, STEPS.indexOf(next)))}
      />
    </div>
  );
}
