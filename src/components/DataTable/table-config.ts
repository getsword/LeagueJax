import {
  type ColumnDef,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  type Row,
  type RowData,
  tableFeatures,
} from "@tanstack/solid-table";

export const dataTableFeatures = tableFeatures({
  columnSizingFeature,
  columnVisibilityFeature,
  columnMeta: {} as { className?: string },
});

export type DataTableColumnDef<T extends RowData, TValue = unknown> = ColumnDef<
  typeof dataTableFeatures,
  T,
  TValue
>;

export type DataTableRow<T extends RowData> = Row<typeof dataTableFeatures, T>;

// Bind column definitions to the same opt-in features as the shared renderer,
// so consumers cannot accidentally declare capabilities the table does not have.
export function createDataTableColumnHelper<T extends RowData>() {
  return createColumnHelper<typeof dataTableFeatures, T>();
}
