"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function InputPreview() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input label="Search" placeholder="Search components" leftIcon={<Search className="h-4 w-4" />} />
      <Input label="Username" defaultValue="taken_name" error="That username is taken." />
      <Input label="Disabled" placeholder="—" disabled />
    </div>
  );
}
