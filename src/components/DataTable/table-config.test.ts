import { describe, expect, expectTypeOf, test } from "bun:test";
import { constructTable } from "@tanstack/solid-table";
import { storeReactivityBindings } from "@tanstack/table-core/store-reactivity-bindings";
import { createDataTableColumnHelper, dataTableFeatures } from "./table-config";

interface TestRow {
  name: string;
  count: number;
  enabled: boolean;
}

const helper = createDataTableColumnHelper<TestRow>();
const columns = helper.columns([
  helper.accessor("name", { header: "Name", meta: { className: "name-cell" } }),
  helper.accessor("count", {
    header: "Count",
    size: 100,
    cell: (context) => {
      expectTypeOf(context.getValue()).toEqualTypeOf<number>();
      return String(context.getValue());
    },
  }),
  helper.accessor("enabled", { header: "Enabled", size: 80 }),
]);

// Use framework-neutral bindings so model contracts run in Bun's default SSR
// environment; Solid rendering and reactive props are checked in the UI preview.
function createTestTable(data: TestRow[]) {
  const features = {
    ...dataTableFeatures,
    coreReactivityFeature: storeReactivityBindings(),
  };
  return constructTable({
    features,
    columns,
    data,
  });
}

describe("DataTable v9 contracts", () => {
  test("provides core rows, typed heterogeneous cells, widths and metadata", () => {
    const table = createTestTable([
      { name: "Alpha", count: 0, enabled: false },
    ]);
    const row = table.getRowModel().rows[0];
    expect(row?.getVisibleCells().map((cell) => cell.getValue())).toEqual([
      "Alpha",
      0,
      false,
    ]);
    expect(table.getColumn("count")?.getSize()).toBe(100);
    expect(table.getColumn("enabled")?.getSize()).toBe(80);
    expect(table.getColumn("name")?.columnDef.meta?.className).toBe(
      "name-cell",
    );
    const cell = row?.getVisibleCells()[1];
    if (!cell) throw new Error("Expected count cell");
    const { getValue } = cell.getContext();
    expect(getValue()).toBe(0);
    const renderer = cell.column.columnDef.cell;
    if (typeof renderer !== "function")
      throw new Error("Expected cell renderer");
    expect(renderer(cell.getContext())).toBe("0");
  });

  test("replaces cached cell values even when the row ID stays the same", () => {
    const table = createTestTable([
      { name: "Alpha", count: 1, enabled: false },
    ]);
    expect(table.getRowModel().rows[0]?.getValue<string>("name")).toBe("Alpha");
    table.setOptions((previous) => ({
      ...previous,
      data: [{ name: "Beta", count: 2, enabled: true }],
    }));
    expect(table.getRowModel().rows[0]?.id).toBe("0");
    expect(
      table
        .getRowModel()
        .rows[0]?.getVisibleCells()
        .map((cell) => cell.getValue()),
    ).toEqual(["Beta", 2, true]);
    table.setOptions((previous) => ({ ...previous, data: [] }));
    expect(table.getRowModel().rows).toEqual([]);
    table.setOptions((previous) => ({
      ...previous,
      data: [{ name: "Gamma", count: 3, enabled: true }],
    }));
    expect(table.getRowModel().rows[0]?.getValue<string>("name")).toBe("Gamma");
  });

  test("refreshes headers and cell definitions when dynamic columns change", () => {
    const table = createTestTable([{ name: "Alpha", count: 1, enabled: true }]);
    expect(table.getHeaderGroups()[0]?.headers).toHaveLength(3);
    expect(table.getRowModel().rows[0]?.getVisibleCells()).toHaveLength(3);
    table.setOptions((previous) => ({
      ...previous,
      columns: helper.columns([
        helper.accessor("name", { header: "名称" }),
        helper.display({
          id: "details",
          header: "详情",
          size: 120,
          cell: () => "Detail",
        }),
      ]),
    }));
    expect(
      table
        .getHeaderGroups()[0]
        ?.headers.map((header) => header.column.columnDef.header),
    ).toEqual(["名称", "详情"]);
    expect(table.getVisibleLeafColumns().map((column) => column.id)).toEqual([
      "name",
      "details",
    ]);
    expect(
      table
        .getRowModel()
        .rows[0]?.getVisibleCells()
        .map((cell) => cell.column.id),
    ).toEqual(["name", "details"]);
    expect(table.getColumn("details")?.getSize()).toBe(120);
  });

  test("keeps headers and body cells aligned when visibility changes", () => {
    const table = createTestTable([{ name: "Alpha", count: 1, enabled: true }]);
    table.setColumnVisibility({ count: false });
    expect(
      table.getHeaderGroups()[0]?.headers.map((header) => header.column.id),
    ).toEqual(["name", "enabled"]);
    expect(
      table
        .getRowModel()
        .rows[0]?.getVisibleCells()
        .map((cell) => cell.column.id),
    ).toEqual(["name", "enabled"]);
    table.setColumnVisibility({});
    expect(table.getVisibleLeafColumns()).toHaveLength(3);
    expect(table.getRowModel().rows[0]?.getVisibleCells()).toHaveLength(3);
  });
});
