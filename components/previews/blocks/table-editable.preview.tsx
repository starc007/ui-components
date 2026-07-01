"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/motion/button";
import { Table, type TableColumn } from "@/components/motion/table";

type Row = { id: string; [key: string]: string };

const INITIAL_ROWS: Row[] = [
  { id: "r1", name: "Ava Cole", role: "Owner", team: "Design" },
  { id: "r2", name: "Leo Frost", role: "Admin", team: "Growth" },
  { id: "r3", name: "Mia Vale", role: "Member", team: "Design" },
  { id: "r4", name: "Kai Reyes", role: "Member", team: "Platform" },
];

const BASE_KEYS = ["name", "role", "team"] as const;
const HEADERS: Record<string, string> = {
  name: "Name",
  role: "Role",
  team: "Team",
};

function EditableCell({
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
      className="-mx-2 w-full rounded-md bg-transparent px-2 py-1 text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:bg-background focus:ring-1 focus:ring-ring"
      placeholder="Empty"
    />
  );
}

export function TableEditablePreview() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [extraKeys, setExtraKeys] = useState<string[]>([]);
  const [nextRow, setNextRow] = useState(5);
  const [nextCol, setNextCol] = useState(1);

  const updateCell = useCallback((id: string, key: string, next: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: next } : row)),
    );
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { id: `r${nextRow}` }]);
    setNextRow((n) => n + 1);
  }, [nextRow]);

  const deleteRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const addColumn = useCallback(() => {
    const key = `field${nextCol}`;
    HEADERS[key] = `Field ${nextCol}`;
    setExtraKeys((prev) => [...prev, key]);
    setNextCol((n) => n + 1);
  }, [nextCol]);

  const removeColumn = useCallback(() => {
    setExtraKeys((prev) => {
      if (prev.length === 0) return prev;
      const dropped = prev[prev.length - 1];
      setRows((rows) =>
        rows.map(({ [dropped]: _drop, ...rest }) => rest as Row),
      );
      return prev.slice(0, -1);
    });
  }, []);

  const columns = useMemo<TableColumn<Row>[]>(() => {
    const dataKeys = [...BASE_KEYS, ...extraKeys];
    const dataColumns: TableColumn<Row>[] = dataKeys.map((key) => ({
      key,
      header: HEADERS[key] ?? key,
      width: key === "name" ? undefined : "160px",
      cell: (row) => (
        <EditableCell
          value={row[key] ?? ""}
          label={`${HEADERS[key] ?? key} for ${row.name || "row"}`}
          onChange={(next) => updateCell(row.id, key, next)}
        />
      ),
    }));

    dataColumns.push({
      key: "__actions",
      header: "",
      align: "center",
      width: "56px",
      cell: (row) => (
        <button
          type="button"
          aria-label={`Delete ${row.name || "row"}`}
          onClick={() => deleteRow(row.id)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    });

    return dataColumns;
  }, [extraKeys, updateCell, deleteRow]);

  const bodyHeight = Math.min(Math.max(rows.length, 1), 6) * 48;

  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" />
          Row
        </Button>
        <Button size="sm" variant="secondary" onClick={addColumn}>
          <Plus className="h-3.5 w-3.5" />
          Column
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={removeColumn}
          disabled={extraKeys.length === 0}
        >
          <X className="h-3.5 w-3.5" />
          Column
        </Button>
        <span className="ml-auto text-muted-foreground text-xs">
          Click any cell to edit
        </span>
      </div>
      <Table
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={48}
        height={bodyHeight}
        emptyState="No rows — add one above"
      />
    </div>
  );
}
