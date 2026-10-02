/** @jsxImportSource solid-js */
import type { ColumnDef } from "@tanstack/solid-table";
import { createMemo } from "solid-js";
import type { OpggCounterDto } from "@/bindings/opgg";
import { AppTooltip } from "@/components/AppTooltip";
import { DataTable } from "@/components/DataTable";
import { LazyImage } from "@/components/LazyImage";
import { useSolidTranslation } from "@/i18n/solid";
import { championIconUrl } from "../assets";
import * as s from "./ChampionMatchups.css";
import { ChampionPanel } from "./ChampionPanel";
import { ChampionRate } from "./ChampionRate";

function MatchupTable(props: {
  flowing: boolean;
  title: string;
  ariaLabel: string;
  rows: OpggCounterDto[];
  championName: (id: number) => string;
}) {
  const { t } = useSolidTranslation();
  const columns = createMemo<ColumnDef<OpggCounterDto>[]>(() => [
    {
      id: "champion",
      header: t("champions.champion"),
      meta: { className: s.cell },
      cell: (context) => (
        <AppTooltip
          content={props.championName(context.row.original.championId)}
        >
          {(triggerProps) => (
            <div {...triggerProps<HTMLDivElement>({ class: s.champion })}>
              <LazyImage
                src={championIconUrl(context.row.original.championId)}
                alt=""
                className={s.portrait}
                fallbackClassName={s.portrait}
              />
              <span class={s.name}>
                {props.championName(context.row.original.championId)}
              </span>
            </div>
          )}
        </AppTooltip>
      ),
    },
    {
      id: "winRate",
      header: t("champions.winRate"),
      size: 100,
      meta: { className: s.numericCell },
      cell: (context) => <ChampionRate value={context.row.original.winRate} />,
    },
    {
      id: "games",
      header: t("champions.gameCount"),
      size: 100,
      meta: { className: s.numericCell },
      cell: (context) => String(context.row.original.play),
    },
  ]);
  return (
    <ChampionPanel
      title={props.title}
      ariaLabel={props.ariaLabel}
      flowing={props.flowing}
    >
      <DataTable
        data={props.rows}
        columns={columns()}
        emptyText={t("champions.noData")}
        stickyHeader={!props.flowing}
        scrollbarMode="outset"
      />
    </ChampionPanel>
  );
}

export function ChampionMatchups(props: {
  flowing: boolean;
  strong: OpggCounterDto[];
  weak: OpggCounterDto[];
  championName: (id: number) => string;
}) {
  const { t } = useSolidTranslation();
  return (
    <>
      <MatchupTable
        flowing={props.flowing}
        title={t("champions.strong")}
        ariaLabel="Strong matchups"
        rows={props.strong}
        championName={props.championName}
      />
      <MatchupTable
        flowing={props.flowing}
        title={t("champions.weak")}
        ariaLabel="Weak matchups"
        rows={props.weak}
        championName={props.championName}
      />
    </>
  );
}
