"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table, type TableColumn } from "@/components/motion/table";
import { cn } from "@/lib/utils";

type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
  mrr: number;
};

const FIRST = ["Ava", "Leo", "Mia", "Kai", "Zoe", "Eli", "Noa", "Ren", "Ivy", "Jude"];
const LAST = ["Cole", "Frost", "Vale", "Reyes", "Okafor", "Sato", "Lund", "Marsh", "Bose", "Quinn"];
const ROLES = ["Owner", "Admin", "Member", "Viewer"];
const STATUSES: Person["status"][] = ["active", "invited", "suspended"];

const PAGE_SIZE = 20;
const MAX_PAGES = 8;

function buildPage(page: number): Person[] {
  const out: Person[] = [];
  const start = page * PAGE_SIZE;
  for (let n = start; n < start + PAGE_SIZE; n++) {
    const first = FIRST[n % FIRST.length];
    const last = LAST[(n * 7) % LAST.length];
    out.push({
      id: String(n),
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${n}@beui.dev`,
      role: ROLES[(n * 3) % ROLES.length],
      status: STATUSES[(n * 5) % STATUSES.length],
      mrr: 12 + ((n * 37) % 488),
    });
  }
  return out;
}

const STATUS_STYLES: Record<Person["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  invited: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function TableAsyncPreview() {
  const [rows, setRows] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current || pageRef.current >= MAX_PAGES) return;
    loadingRef.current = true;
    setLoading(true);
    // Simulate a network request.
    setTimeout(() => {
      const page = pageRef.current;
      setRows((prev) => [...prev, ...buildPage(page)]);
      pageRef.current = page + 1;
      loadingRef.current = false;
      setLoading(false);
    }, 700);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    loadMore();
  }, []);

  const columns = useMemo<TableColumn<Person>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (r) => <span className="font-medium">{r.name}</span>,
      },
      { key: "email", header: "Email", width: "220px" },
      { key: "role", header: "Role", width: "110px" },
      {
        key: "status",
        header: "Status",
        width: "120px",
        cell: (r) => (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-medium text-xs capitalize",
              STATUS_STYLES[r.status],
            )}
          >
            {r.status}
          </span>
        ),
      },
      {
        key: "mrr",
        header: "MRR",
        align: "right",
        width: "100px",
        cell: (r) => <span className="tabular-nums">${r.mrr.toLocaleString()}</span>,
      },
    ],
    [],
  );

  const done = pageRef.current >= MAX_PAGES;

  return (
    <div className="flex w-full justify-center p-4">
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between px-1 text-muted-foreground text-xs">
          <span>{rows.length.toLocaleString()} loaded</span>
          <span>{loading ? "Loading…" : done ? "All loaded" : "Scroll for more"}</span>
        </div>
        <Table
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          height={420}
          rowHeight={52}
          onEndReached={loadMore}
          loading={loading}
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}
