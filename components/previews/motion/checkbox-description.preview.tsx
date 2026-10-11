"use client";

import { useState } from "react";
import { Checkbox } from "@/components/motion/checkbox";

export function CheckboxDescriptionPreview() {
  const [comments, setComments] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(false);

  return (
    <div className="flex w-full max-w-64 flex-col gap-3">
      <Checkbox
        checked={comments}
        onCheckedChange={setComments}
        label="Comments"
        description="Replies on threads you started."
      />
      <Checkbox
        checked={mentions}
        onCheckedChange={setMentions}
        label="Mentions"
        description="Whenever someone tags you by name."
      />
      <Checkbox
        checked={digest}
        onCheckedChange={setDigest}
        label="Weekly digest"
        description="A summary of activity every Monday."
      />
      <Checkbox
        checked={false}
        disabled
        onCheckedChange={() => {}}
        label="SMS alerts"
        description="Add a phone number to enable."
      />
    </div>
  );
}
