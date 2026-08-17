import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Table, type TableColumn } from "@/components/motion/table";

type Row = { id: string; name: string; role: string };

const DATA: Row[] = [{ id: "r1", name: "Ava Cole", role: "Owner" }];

function minWidthOf(container: HTMLElement) {
  const table = container.querySelector("table");
  return table?.style.minWidth ?? null;
}

afterEach(() => {
  cleanup();
  document.documentElement.style.fontSize = "";
});

describe("Table intrinsic width floor", () => {
  test("a column of bare inputs is floored at a width a value fits in", () => {
    const columns: TableColumn<Row>[] = [
      { key: "name", header: "Name", editable: true },
      { key: "role", header: "Role", editable: true, width: "180px" },
    ];
    const { container } = render(
      <Table data={DATA} columns={columns} getRowId={(r) => r.id} onCellEdit={() => {}} />,
    );

    // 120 for the input column it cannot measure + the 180 the other declared.
    expect(minWidthOf(container)).toBe("max(100%, 300px)");
  });

  test("a column with content keeps sharing the remainder", () => {
    const columns: TableColumn<Row>[] = [
      { key: "name", header: "Name" },
      { key: "role", header: "Role", width: "180px" },
    ];
    const { container } = render(
      <Table data={DATA} columns={columns} getRowId={(r) => r.id} />,
    );

    expect(minWidthOf(container)).toBe("max(100%, 244px)");
  });

  test("a renamable header makes every shared column an input column", () => {
    const columns: TableColumn<Row>[] = [
      { key: "name", header: "Name" },
      { key: "role", header: "Role", width: "1.5fr" },
    ];
    const { container } = render(
      <Table
        data={DATA}
        columns={columns}
        getRowId={(r) => r.id}
        onColumnRename={() => {}}
      />,
    );

    expect(minWidthOf(container)).toBe("max(100%, 240px)");
  });

  test("declared rem resolves; fr and % share the remainder", () => {
    const columns: TableColumn<Row>[] = [
      { key: "name", header: "Name", width: "12rem" },
      { key: "role", header: "Role", width: "2fr" },
    ];
    const { container } = render(
      <Table data={DATA} columns={columns} getRowId={(r) => r.id} />,
    );

    // 12rem = 192, plus the default 64 minimum for the fr column.
    expect(minWidthOf(container)).toBe("max(100%, 256px)");
  });

  test("a rem width is worth what the document's root says it is", () => {
    document.documentElement.style.fontSize = "20px";
    const columns: TableColumn<Row>[] = [
      { key: "name", header: "Name", width: "12rem" },
      { key: "role", header: "Role", width: "2fr" },
    ];
    const { container } = render(
      <Table data={DATA} columns={columns} getRowId={(r) => r.id} />,
    );

    // The browser lays that column out at 240, so the floor has to reserve 240.
    expect(minWidthOf(container)).toBe("max(100%, 304px)");
  });

  test("minColumnWidth raises the floor for shared columns", () => {
    const columns: TableColumn<Row>[] = [
      { key: "name", header: "Name", editable: true },
      { key: "role", header: "Role" },
    ];
    const { container } = render(
      <Table
        data={DATA}
        columns={columns}
        getRowId={(r) => r.id}
        minColumnWidth={160}
        onCellEdit={() => {}}
      />,
    );

    expect(minWidthOf(container)).toBe("max(100%, 320px)");
  });

  test("the checkbox column is counted when the table is selectable", () => {
    const columns: TableColumn<Row>[] = [
      { key: "name", header: "Name", width: "100px" },
    ];
    const { container } = render(
      <Table data={DATA} columns={columns} getRowId={(r) => r.id} selectable />,
    );

    expect(minWidthOf(container)).toBe("max(100%, 148px)");
  });
});
