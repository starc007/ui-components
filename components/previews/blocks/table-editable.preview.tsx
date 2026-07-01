"use client";

import { useCallback, useMemo, useState } from "react";
import { Switch } from "@/components/motion/switch";
import { Table, type TableColumn } from "@/components/motion/table";

type Row = { id: string; [key: string]: string };

const INITIAL_ROWS: Row[] = [
  { id: "r1", name: "Ava Cole", role: "Owner", team: "Design" },
  { id: "r2", name: "Leo Frost", role: "Admin", team: "Growth" },
  { id: "r3", name: "Mia Vale", role: "Member", team: "Design" },
  { id: "r4", name: "Kai Reyes", role: "Member", team: "Platform" },
];

export function TableEditablePreview() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [keys, setKeys] = useState<string[]>(["name", "role", "team"]);
  const [labels, setLabels] = useState<Record<string, string>>({
    name: "Name",
    role: "Role",
    team: "Team",
  });
  const [nextRow, setNextRow] = useState(5);
  const [nextCol, setNextCol] = useState(1);
  const [editable, setEditable] = useState(true);

  const onCellEdit = useCallback(
    (rowId: string, key: string, value: string) => {
      setRows((prev) =>
        prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)),
      );
    },
    [],
  );

  const onInsertRow = useCallback(
    (index: number, position: "before" | "after") => {
      const at = position === "after" ? index + 1 : index;
      setRows((prev) => {
        const next = [...prev];
        next.splice(at, 0, { id: `r${nextRow}` });
        return next;
      });
      setNextRow((n) => n + 1);
    },
    [nextRow],
  );

  const onDeleteRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  }, []);

  const onInsertColumn = useCallback(
    (index: number, position: "before" | "after") => {
      const key = `field${nextCol}`;
      const at = position === "after" ? index + 1 : index;
      setLabels((prev) => ({ ...prev, [key]: `Field ${nextCol}` }));
      setKeys((prev) => {
        const next = [...prev];
        next.splice(at, 0, key);
        return next;
      });
      setRows((prev) => prev.map((row) => ({ ...row, [key]: "" })));
      setNextCol((n) => n + 1);
    },
    [nextCol],
  );

  const onColumnRename = useCallback((key: string, value: string) => {
    setLabels((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onDeleteColumn = useCallback((key: string) => {
    setKeys((prev) => prev.filter((k) => k !== key));
    setRows((prev) =>
      prev.map((row) => {
        const next = { ...row };
        delete next[key];
        return next;
      }),
    );
  }, []);

  const columns = useMemo<TableColumn<Row>[]>(
    () =>
      keys.map((key, i) => ({
        key,
        header: labels[key] ?? key,
        editable,
        width: i === 0 ? undefined : "180px",
      })),
    [keys, labels, editable],
  );

  const bodyHeight = Math.min(Math.max(rows.length, 1), 6) * 48;

  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {editable
            ? "Click a cell to edit. Use the column and row handles to insert or delete."
            : "Read-only."}
        </p>
        <Switch
          checked={editable}
          onCheckedChange={setEditable}
          label="Editable"
        />
      </div>
      <Table
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={48}
        height={bodyHeight}
        onCellEdit={editable ? onCellEdit : undefined}
        onColumnRename={editable ? onColumnRename : undefined}
        onInsertRow={editable ? onInsertRow : undefined}
        onDeleteRow={editable ? onDeleteRow : undefined}
        onInsertColumn={editable ? onInsertColumn : undefined}
        onDeleteColumn={editable ? onDeleteColumn : undefined}
        emptyState={
          <button
            type="button"
            onClick={() => onInsertRow(0, "before")}
            className="rounded-full border border-border px-3 py-1.5 font-medium text-foreground text-xs transition-colors hover:bg-muted"
          >
            Insert first row
          </button>
        }
      />
    </div>
  );
}
