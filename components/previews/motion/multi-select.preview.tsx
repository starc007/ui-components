"use client";

import { Circle } from "lucide-react";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectInput,
  MultiSelectItem,
  MultiSelectLabel,
  MultiSelectList,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/motion/multi-select";

const colors = {
  design: "fill-rose-500 text-rose-500",
  engineering: "fill-sky-500 text-sky-500",
  product: "fill-amber-500 text-amber-500",
  research: "fill-violet-500 text-violet-500",
  marketing: "fill-emerald-500 text-emerald-500",
  operations: "fill-slate-500 text-slate-500",
};

function Option({
  value,
  children,
}: {
  value: keyof typeof colors;
  children: string;
}) {
  return (
    <MultiSelectItem value={value} textValue={children}>
      <span className="flex items-center gap-2.5">
        <Circle aria-hidden="true" className={`size-2.5 ${colors[value]}`} />
        {children}
      </span>
    </MultiSelectItem>
  );
}

export function MultiSelectPreview() {
  return (
    <div className="flex min-h-[420px] w-full items-start justify-center px-4 pt-24">
      <div className="w-full max-w-sm">
        <MultiSelect defaultValue={["design", "engineering"]}>
          <MultiSelectTrigger>
            <MultiSelectValue placeholder="Choose teams" />
            <MultiSelectInput aria-label="Search teams" />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectList ariaLabel="Teams">
              <MultiSelectGroup>
                <MultiSelectLabel>Product teams</MultiSelectLabel>
                <Option value="design">Design</Option>
                <Option value="engineering">Engineering</Option>
                <Option value="product">Product</Option>
                <Option value="research">Research</Option>
              </MultiSelectGroup>
              <MultiSelectGroup>
                <MultiSelectLabel>Business teams</MultiSelectLabel>
                <Option value="marketing">Marketing</Option>
                <Option value="operations">Operations</Option>
              </MultiSelectGroup>
              <MultiSelectEmpty>No teams found.</MultiSelectEmpty>
            </MultiSelectList>
          </MultiSelectContent>
        </MultiSelect>
      </div>
    </div>
  );
}
