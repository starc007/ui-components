"use client";

import { Testimonials } from "@/components/blocks/testimonials";

const items = [
  { name: "Ada Lovelace", handle: "@ada", body: "Shipped a marketing site in a weekend. Felt illegal." },
  { name: "Linus T.", handle: "@torvalds", body: "Finally an open source UI kit that doesn't reek of AI slop." },
  { name: "Grace Hopper", handle: "@grace", body: "The motion details make every interaction feel intentional." },
  { name: "Donald K.", handle: "@knuth", body: "Typed, composable, fast. The trifecta." },
  { name: "Margaret H.", handle: "@hamilton", body: "Dark mode is actually good for once." },
  { name: "Alan T.", handle: "@alan", body: "I copy-pasted four blocks. Now my landing page is done." },
];

export function TestimonialsPreview() {
  return (
    <Testimonials
      title="What people say"
      description="Reviews collected from the wild."
      items={items}
    />
  );
}
