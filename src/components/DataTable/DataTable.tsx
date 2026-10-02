/** @jsxImportSource solid-js */
import { keyArray } from "@solid-primitives/keyed";
import {
  type Column,
  createTable,
  FlexRender,
  type RowData,
} from "@tanstack/solid-table";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { ScrollArea } from "@/components/scroll-area";
import * as s from "./DataTable.css.ts";
import {
  type DataTableColumnDef,
  type DataTableRow,
  dataTableFeatures,
} from "./table-config";

interface DataTableProps<T extends RowData> {
  className?: string;
  data: T[];
  // biome-ignore lint/suspicious/noExplicitAny: Each column can have a different accessor value type.
  columns: DataTableColumnDef<T, any>[];
  emptyText?: string;
  getRowClassName?: (row: DataTableRow<T>) => string | undefined;
  // Requires a bounded parent; only the table body owns a scroll viewport.
  stickyHeader?: boolean;
  // Outset tracks require a reserved gutter outside the table frame.
  scrollbarMode?: "inline" | "outset";
  outsetWidth?: string;
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

// Each layout table needs its own DOM nodes but shares the same column sizing.
function TableColumns<T extends RowData>(props: {
  columns: Column<typeof dataTableFeatures, T>[];
}): JSX.Element {
  const colNodes = keyArray(
    () => props.columns,
    (col) => col.id,
    (col) => {
      const hasExplicitSize = () =>
        col().columnDef.size != null &&
        col().columnDef.size !== 150 &&
        col().columnDef.size !== 0;
      return (
        <col
          class={s.column}
          style={assignInlineVars({
            [s.columnWidth]: hasExplicitSize()
              ? `${col().columnDef.size}px`
              : undefined,
          })}
        />
      );
    },
  );
  return <colgroup>{colNodes()}</colgroup>;
}

// Fixed mode separates the header from scrolling without duplicating it. The
// layout tables are presentational so their explicit rows form one ARIA table.
export function DataTable<T extends RowData>(
  props: DataTableProps<T>,
): JSX.Element {
  const scrollbarMode = () => props.scrollbarMode ?? "inline";
  const table = createTable({
    features: dataTableFeatures,
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
  });
  const headerRows = keyArray(
    () => table.getHeaderGroups(),
    (headerGroup) => headerGroup.id,
    (headerGroup) => {
      const headerCells = keyArray(
        () => headerGroup().headers,
        (header) => header.id,
        (header) => {
          const meta = () => header().column.columnDef.meta;
          const cls = () => joinClassNames(s.headCell, meta()?.className);
          return (
            <th
              class={cls()}
              role={props.stickyHeader ? "columnheader" : undefined}
              colSpan={header().colSpan}
              scope={header().colSpan > 1 ? "colgroup" : "col"}
            >
              <Show when={!header().isPlaceholder}>
                <FlexRender header={header()} />
              </Show>
            </th>
          );
        },
      );
      return (
        <tr role={props.stickyHeader ? "row" : undefined}>{headerCells()}</tr>
      );
    },
  );
  const bodyRows = keyArray(
    () => table.getRowModel().rows,
    (row) => row.id,
    (row) => {
      const visibleCells = keyArray(
        () => row().getVisibleCells(),
        (cell) => cell.id,
        (cell) => {
          const meta = () => cell().column.columnDef.meta;
          const cls = () =>
            meta()?.className
              ? `${s.bodyCell} ${meta()?.className}`
              : s.bodyCell;
          return (
            <td class={cls()} role={props.stickyHeader ? "cell" : undefined}>
              <FlexRender cell={cell()} />
            </td>
          );
        },
      );
      return (
        <tr
          data-row=""
          role={props.stickyHeader ? "row" : undefined}
          class={props.getRowClassName?.(row())}
        >
          {visibleCells()}
        </tr>
      );
    },
  );

  const body = () => (
    <tbody role={props.stickyHeader ? "rowgroup" : undefined}>
      <Show
        when={table.getRowModel().rows.length > 0}
        fallback={
          <tr role={props.stickyHeader ? "row" : undefined}>
            <td
              role={props.stickyHeader ? "cell" : undefined}
              colSpan={table.getVisibleLeafColumns().length}
              class={s.empty}
            >
              {props.emptyText}
            </td>
          </tr>
        }
      >
        {bodyRows()}
      </Show>
    </tbody>
  );

  return (
    <div
      class={joinClassNames(
        s.tableWrap({
          stickyHeader: props.stickyHeader ? "enabled" : "disabled",
          scrollbarMode: scrollbarMode(),
        }),
        props.className,
      )}
      role={props.stickyHeader ? "table" : undefined}
    >
      <Show
        when={props.stickyHeader}
        fallback={
          <table class={s.table}>
            <TableColumns columns={table.getVisibleLeafColumns()} />
            <thead>{headerRows()}</thead>
            {body()}
          </table>
        }
      >
        <div class={s.header({ scrollbarMode: scrollbarMode() })}>
          <table class={s.table} role="presentation">
            <TableColumns columns={table.getVisibleLeafColumns()} />
            <thead role={props.stickyHeader ? "rowgroup" : undefined}>
              {headerRows()}
            </thead>
          </table>
        </div>
        <ScrollArea
          className={s.bodyScroller}
          viewportClassName={s.bodyViewport}
          direction="vertical"
          mode={scrollbarMode()}
          outsetWidth={props.outsetWidth}
          scrollbarSize={s.bodyScrollbarSize}
        >
          <table class={s.table} role="presentation">
            <TableColumns columns={table.getVisibleLeafColumns()} />
            {body()}
          </table>
        </ScrollArea>
      </Show>
    </div>
  );
}
