"use client";

import { ShareButton } from "@/components/motion/share-button";

// The button shares nothing itself; each action calls this with its id
// ("copy", "email" or "message"). Return a promise to show the check once
// your share settles.
async function share(_id: string) {
  // Copy a link, open a composer or call your API here.
}

export function ShareButtonUsage() {
  return (
    // The actions fan out above the button; leave room for them.
    <div className="pt-20">
      <ShareButton onAction={share} />
    </div>
  );
}
