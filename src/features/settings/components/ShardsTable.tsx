/** @jsxImportSource solid-js */
import { Key } from "@solid-primitives/keyed";
import type { JSX } from "solid-js";
import { createMemo, createSignal, Show } from "solid-js";
import type { ShardInfoDto } from "@/bindings/shards";
import { CopyButton } from "@/components/CopyButton";
import {
  createDataTableColumnHelper,
  DataTable,
  monospace,
  mutedCell,
} from "@/components/DataTable";
import { useSolidTranslation } from "@/i18n/solid";
import * as s from "./ShardsTable.css.ts";

interface ShardsTableProps {
  shards: ShardInfoDto[];
  labelMap: Map<string, string>;
}

const col = createDataTableColumnHelper<ShardInfoDto>();

// Solid table templates run as component setup; JSX bindings keep translated
// headers reactive without rebuilding the column definitions on locale changes.
export function ShardsTable(props: ShardsTableProps): JSX.Element {
  const { t } = useSolidTranslation();
  const [highlightedId, setHighlightedId] = createSignal<string | null>(null);

  const columns = createMemo(() =>
    col.columns([
      col.accessor("label", {
        header: () => <span>{t("settings.shards.columns.name")}</span>,
        cell: (info) => {
          const name = info.getValue();
          return (
            <span class={s.copyCell}>
              <span class={s.copyText}>{name}</span>
              <CopyButton
                text={name}
                className={s.copyButton}
                aria-label="Copy shard name"
              />
            </span>
          );
        },
      }),
      col.accessor("id", {
        header: () => <span>{t("settings.shards.columns.id")}</span>,
        meta: { className: monospace },
        cell: (info) => {
          const id = info.getValue() as string;
          return (
            <span class={s.copyCell} title={id}>
              <span class={s.copyText}>{id}</span>
              <CopyButton
                text={id}
                className={s.copyButton}
                aria-label="Copy shard ID"
              />
            </span>
          );
        },
      }),
      col.accessor("status", {
        header: () => <span>{t("settings.shards.columns.status")}</span>,
        size: 80,
        cell: (info) => {
          const status = info.getValue() as ShardInfoDto["status"];
          return (
            <span class={s.status({ kind: status.kind })}>
              {t(`settings.shards.status.${status.kind}`)}
            </span>
          );
        },
      }),
      col.accessor("dependencies", {
        header: () => <span>{t("settings.shards.columns.dependencies")}</span>,
        cell: (info) => {
          const deps = info.getValue() as string[];
          return (
            <Show
              when={deps.length > 0}
              fallback={
                <span class={mutedCell}>
                  {t("settings.shards.noDependencies")}
                </span>
              }
            >
              <div class={s.depList}>
                <Key each={deps} by={(depId) => depId}>
                  {(depId) => (
                    <button
                      type="button"
                      class={s.depItem}
                      onMouseEnter={() => setHighlightedId(depId())}
                      onMouseLeave={() => setHighlightedId(null)}
                    >
                      {props.labelMap.get(depId()) ?? depId().slice(0, 8)}
                    </button>
                  )}
                </Key>
              </div>
            </Show>
          );
        },
      }),
      col.accessor("setupDurationMs", {
        header: () => <span>{t("settings.shards.columns.duration")}</span>,
        size: 90,
        cell: (info) => {
          const ms = info.getValue() as number | null;
          return ms != null ? (
            `${ms.toFixed(1)} ms`
          ) : (
            <span class={mutedCell}>{t("settings.shards.noDuration")}</span>
          );
        },
      }),
    ]),
  );

  return (
    <DataTable
      data={props.shards}
      columns={columns()}
      getRowClassName={(row) =>
        row.original.id === highlightedId() ? s.rowHighlight : undefined
      }
      stickyHeader={false}
    />
  );
}
