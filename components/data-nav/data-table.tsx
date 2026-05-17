"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Column<T> = {
  key: keyof T & string;
  header: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
};

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  className?: string;
}

export function DataTable<T>({ data, columns, rowKey, empty, className }: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const arr = [...data];
    arr.sort((a, b) => {
      const av = a[sort.key as keyof T];
      const bv = b[sort.key as keyof T];
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, sort]);

  const toggle = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-elev)", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-(--color-border)">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-(--color-fg-muted)",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    !c.align && "text-left",
                    c.className,
                  )}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className="inline-flex items-center gap-1 hover:text-(--color-fg)"
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : null}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-(--color-fg-muted)">
                  {empty ?? "No data"}
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-(--color-border) last:border-0 transition-colors hover:bg-(--color-bg)/40"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-4 py-3 text-(--color-fg)",
                        c.align === "right" && "text-right tabular-nums",
                        c.align === "center" && "text-center",
                      )}
                    >
                      {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
