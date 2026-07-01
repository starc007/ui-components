"use client";

export function EditableCell({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (next: string) => void;
}) {
  return (
    <input
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Empty"
      className="-mx-2 w-full rounded-md bg-transparent px-2 py-1 text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:bg-muted focus:ring-1 focus:ring-ring"
    />
  );
}
