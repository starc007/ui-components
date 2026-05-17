"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-nav/data-table";

type Row = { id: string; name: string; email: string; role: string; status: "active" | "invited" | "suspended"; mrr: number };

const rows: Row[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Owner", status: "active", mrr: 199 },
  { id: "2", name: "Linus Torvalds", email: "linus@example.com", role: "Admin", status: "active", mrr: 99 },
  { id: "3", name: "Grace Hopper", email: "grace@example.com", role: "Member", status: "invited", mrr: 0 },
  { id: "4", name: "Donald Knuth", email: "donald@example.com", role: "Member", status: "suspended", mrr: 49 },
];

const statusVariant = { active: "success", invited: "accent", suspended: "danger" } as const;

export function DataTablePreview() {
  return (
    <DataTable
      data={rows}
      rowKey={(r) => r.id}
      columns={[
        { key: "name", header: "Name", sortable: true },
        { key: "email", header: "Email" },
        { key: "role", header: "Role", sortable: true },
        { key: "status", header: "Status", render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
        { key: "mrr", header: "MRR", align: "right", sortable: true, render: (r) => `$${r.mrr}` },
      ]}
    />
  );
}
