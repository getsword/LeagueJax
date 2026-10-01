/** @jsxImportSource solid-js */
import { Key } from "@solid-primitives/keyed";
import { invoke } from "@tauri-apps/api/core";
import { createEffect, createMemo, createSignal, Index, Show } from "solid-js";
import type {
  OpggBuildDto,
  OpggChampionDetailDto,
  OpggChampionListDto,
  OpggChampionSummaryDto,
  OpggCounterDto,
} from "@/bindings/opgg";
import { LazyImage } from "@/components/LazyImage";
import { ScrollArea } from "@/components/scroll-area/ScrollArea";
import { useSolidTranslation } from "@/i18n/solid";
import { createSolidQuery } from "@/infra/solid-query";
import { championIconUrl, useChampionAssets } from "../assets";
import {
  CHAMPION_POSITIONS,
  filterChampions,
  formatRate,
  laneStats,
  preferredPosition,
} from "../model";
import * as s from "./ChampionsRoute.css.ts";

function cx(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function rateClass(rate: number): string {
  return rate >= 0.5 ? s.win : s.loss;
}

export default function ChampionsRoute() {
  const { t } = useSolidTranslation();
  const assets = useChampionAssets();
  const [query, setQuery] = createSignal("");
  const [laneFilter, setLaneFilter] = createSignal<string | null>(null);
  const [selectedId, setSelectedId] = createSignal<number | null>(null);
  const [position, setPosition] = createSignal<string | null>(null);
  const listQuery = createSolidQuery<OpggChampionListDto>(
    () => "opgg:champions:ranked",
    () => invoke<OpggChampionListDto>("opgg_list_champions"),
  );
  const champions = createMemo(() => listQuery.data()?.champions ?? []);
  const visibleChampions = createMemo(() =>
    filterChampions(champions(), query(), laneFilter(), (championId) => {
      return assets().names[championId] ?? "";
    }),
  );
  const selected = createMemo(
    () => champions().find((champion) => champion.id === selectedId()) ?? null,
  );

  createEffect(() => {
    const rows = visibleChampions();
    const current = selectedId();
    if (current !== null && rows.some((champion) => champion.id === current)) {
      return;
    }
    setSelectedId(rows[0]?.id ?? null);
  });

  createEffect(() => {
    const champion = selected();
    if (!champion) {
      return;
    }
    const current = position();
    if (
      current &&
      champion.positions.some((entry) => entry.position === current)
    ) {
      return;
    }
    setPosition(preferredPosition(champion.positions));
  });

  createEffect(() => {
    const filter = laneFilter();
    const champion = selected();
    if (!champion || !filter) {
      return;
    }
    if (champion.positions.some((entry) => entry.position === filter)) {
      setPosition(filter);
    }
  });

  const detailKey = createMemo(() => {
    const id = selectedId();
    const lane = position();
    if (id === null || !lane) {
      return null;
    }
    return ["opgg:champion", id, lane] as const;
  });
  const detailQuery = createSolidQuery<OpggChampionDetailDto>(
    detailKey,
    (key) => {
      const [, championId, lane] = key as readonly [string, number, string];
      return invoke<OpggChampionDetailDto>("opgg_get_champion_detail", {
        championId,
        position: lane,
      });
    },
  );

  const championName = (championId: number) =>
    assets().names[championId] ?? `#${championId}`;

  return (
    <div class={s.page}>
      <section class={s.panel}>
        <div class={s.listHeader}>
          <fieldset class={s.filters}>
            <legend class={s.filterLegend}>Filter by position</legend>
            <button
              type="button"
              class={cx(
                s.filterButton,
                laneFilter() === null && s.laneButtonActive,
              )}
              onClick={() => setLaneFilter(null)}
            >
              {t("champions.allPositions")}
            </button>
            <Index each={CHAMPION_POSITIONS}>
              {(lane) => (
                <button
                  type="button"
                  class={cx(
                    s.filterButton,
                    laneFilter() === lane() && s.laneButtonActive,
                  )}
                  onClick={() => setLaneFilter(lane())}
                >
                  {t(`champions.positions.${lane()}`)}
                </button>
              )}
            </Index>
          </fieldset>
          <input
            class={s.search}
            type="search"
            value={query()}
            placeholder={t("champions.search")}
            aria-label="Search champions"
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
        <ScrollArea className={s.list} direction="vertical">
          <Show
            when={!listQuery.isLoading() || champions().length > 0}
            fallback={<p class={s.status}>{t("champions.loading")}</p>}
          >
            <Show
              when={!listQuery.error()}
              fallback={<p class={s.status}>{t("champions.loadFailed")}</p>}
            >
              <Show
                when={visibleChampions().length > 0}
                fallback={<p class={s.status}>{t("champions.empty")}</p>}
              >
                <Key each={visibleChampions()} by={(champion) => champion.id}>
                  {(champion) => (
                    <ChampionRow
                      champion={champion()}
                      name={championName(champion().id)}
                      lane={laneFilter()}
                      active={champion().id === selectedId()}
                      winLabel={t("champions.winRate")}
                      onSelect={() => setSelectedId(champion().id)}
                    />
                  )}
                </Key>
              </Show>
            </Show>
          </Show>
        </ScrollArea>
      </section>
      <Show
        when={selected()}
        fallback={<p class={s.status}>{t("champions.loading")}</p>}
      >
        {(champion) => (
          <ChampionDetail
            champion={champion()}
            name={championName(champion().id)}
            position={position() ?? preferredPosition(champion().positions)}
            detail={detailQuery.data()}
            detailFailed={Boolean(detailQuery.error())}
            detailLoading={detailQuery.isLoading()}
            version={listQuery.data()?.version ?? ""}
            championName={championName}
            itemIcon={(itemId) => assets().itemIcons[itemId] ?? null}
            spellIcon={(spellId) => assets().spellIcons[spellId] ?? null}
            onPosition={setPosition}
          />
        )}
      </Show>
    </div>
  );
}

function ChampionRow(props: {
  champion: OpggChampionSummaryDto;
  name: string;
  lane: string | null;
  active: boolean;
  winLabel: string;
  onSelect: () => void;
}) {
  const winRate = () =>
    (props.lane
      ? laneStats(props.champion.positions, props.lane)?.winRate
      : props.champion.winRate) ?? props.champion.winRate;

  return (
    <button
      type="button"
      class={cx(s.championButton, props.active && s.championButtonActive)}
      onClick={() => props.onSelect()}
    >
      <LazyImage
        src={championIconUrl(props.champion.id)}
        alt=""
        className={s.portrait}
      />
      <span class={s.championName}>{props.name}</span>
      <span class={cx(s.rate, rateClass(winRate()))}>
        <span class={s.muted}>{props.winLabel} </span>
        {formatRate(winRate())}
      </span>
    </button>
  );
}

function ChampionDetail(props: {
  champion: OpggChampionSummaryDto;
  name: string;
  position: string;
  detail: OpggChampionDetailDto | undefined;
  detailFailed: boolean;
  detailLoading: boolean;
  version: string;
  championName: (championId: number) => string;
  itemIcon: (itemId: number) => string | null;
  spellIcon: (spellId: number) => string | null;
  onPosition: (position: string) => void;
}) {
  const { t } = useSolidTranslation();
  const stats = () => props.detail ?? null;

  return (
    <section class={s.detail}>
      <div class={s.header}>
        <LazyImage
          src={championIconUrl(props.champion.id)}
          alt=""
          className={s.headerPortrait}
        />
        <div>
          <div class={s.titleRow}>
            <h1 class={s.title}>{props.name}</h1>
            <span class={s.muted}>
              {t("champions.tier", {
                tier: String(stats()?.tier || props.champion.tier || 0),
              })}
            </span>
          </div>
          <p class={s.muted}>
            {t("champions.source", { version: props.version || "—" })}
          </p>
          <div class={s.stats}>
            <Stat
              label={t("champions.winRate")}
              value={formatRate(stats()?.winRate ?? props.champion.winRate)}
              tone={rateClass(stats()?.winRate ?? props.champion.winRate)}
            />
            <Stat
              label={t("champions.pickRate")}
              value={formatRate(stats()?.pickRate ?? props.champion.pickRate)}
            />
            <Stat
              label={t("champions.banRate")}
              value={formatRate(stats()?.banRate ?? props.champion.banRate)}
            />
          </div>
        </div>
      </div>
      <div class={s.lanes}>
        <Key each={props.champion.positions} by={(lane) => lane.position}>
          {(lane) => (
            <button
              type="button"
              class={cx(
                s.laneButton,
                lane().position === props.position && s.laneButtonActive,
              )}
              onClick={() => props.onPosition(lane().position)}
            >
              {t(`champions.positions.${lane().position}`)}{" "}
              {formatRate(lane().winRate)}
            </button>
          )}
        </Key>
      </div>
      <Show
        when={!props.detailLoading || props.detail}
        fallback={<p class={s.status}>{t("champions.loading")}</p>}
      >
        <Show
          when={!props.detailFailed}
          fallback={<p class={s.status}>{t("champions.detailFailed")}</p>}
        >
          <Show when={props.detail}>
            {(detail) => (
              <div class={s.body}>
                <div class={s.stack}>
                  <section>
                    <h2 class={s.sectionTitle}>{t("champions.skills")}</h2>
                    <div class={s.skillPriority}>
                      <Key each={detail().skillPriority} by={(skill) => skill}>
                        {(skill) => (
                          <span
                            class={cx(
                              s.skillKey,
                              skill() === "R" && s.skillUltimate,
                            )}
                          >
                            {skill()}
                          </span>
                        )}
                      </Key>
                    </div>
                    <div class={s.skillOrder}>
                      <Index each={detail().skillOrder}>
                        {(skill) => (
                          <span
                            class={cx(
                              s.skillStep,
                              skill() === "R" && s.skillUltimate,
                            )}
                          >
                            {skill()}
                          </span>
                        )}
                      </Index>
                    </div>
                    <p class={s.muted}>
                      {t("champions.winRate")}{" "}
                      {formatRate(detail().skillWinRate)}
                      {" · "}
                      {t("champions.pickRate")}{" "}
                      {formatRate(detail().skillPickRate)}
                    </p>
                  </section>
                  <BuildLine
                    label={t("champions.spells")}
                    build={detail().summonerSpells[0]}
                    icon={props.spellIcon}
                  />
                  <BuildLine
                    label={t("champions.starter")}
                    build={detail().starterItems[0]}
                    icon={props.itemIcon}
                  />
                  <BuildLine
                    label={t("champions.boots")}
                    build={detail().boots[0]}
                    icon={props.itemIcon}
                  />
                  <Key
                    each={detail().coreItems}
                    by={(build) => `${build.ids.join("-")}:${build.play}`}
                  >
                    {(build, index) => (
                      <BuildLine
                        label={index() === 0 ? t("champions.core") : ""}
                        build={build()}
                        icon={props.itemIcon}
                      />
                    )}
                  </Key>
                  <section>
                    <h2 class={s.sectionTitle}>{t("champions.situational")}</h2>
                    <div class={s.icons}>
                      <Index each={detail().lastItems}>
                        {(build) => (
                          <ItemIcon src={props.itemIcon(build().ids[0] ?? 0)} />
                        )}
                      </Index>
                    </div>
                  </section>
                </div>
                <div class={s.matchups}>
                  <MatchupColumn
                    title={t("champions.strong")}
                    rows={detail().strongAgainst}
                    championName={props.championName}
                    gamesLabel={(count) =>
                      t("champions.games", { count: String(count) })
                    }
                  />
                  <MatchupColumn
                    title={t("champions.weak")}
                    rows={detail().weakAgainst}
                    championName={props.championName}
                    gamesLabel={(count) =>
                      t("champions.games", { count: String(count) })
                    }
                  />
                </div>
              </div>
            )}
          </Show>
        </Show>
      </Show>
    </section>
  );
}

function Stat(props: { label: string; value: string; tone?: string }) {
  return (
    <span>
      <span class={s.muted}>{props.label} </span>
      <span class={cx(s.rate, props.tone)}>{props.value}</span>
    </span>
  );
}

function BuildLine(props: {
  label: string;
  build: OpggBuildDto | undefined;
  icon: (id: number) => string | null;
}) {
  return (
    <Show when={props.build}>
      {(build) => (
        <div class={s.buildRow}>
          <span class={s.sectionTitle}>{props.label}</span>
          <div class={s.icons}>
            <Index each={build().ids}>
              {(itemId) => <ItemIcon src={props.icon(itemId())} />}
            </Index>
          </div>
          <span class={cx(s.rate, rateClass(build().winRate))}>
            {formatRate(build().winRate)}
          </span>
        </div>
      )}
    </Show>
  );
}

function ItemIcon(props: { src: string | null }) {
  return (
    <Show when={props.src} fallback={<span class={s.icon} />}>
      {(src) => <LazyImage src={src()} alt="" className={s.icon} />}
    </Show>
  );
}

function MatchupColumn(props: {
  title: string;
  rows: OpggCounterDto[];
  championName: (championId: number) => string;
  gamesLabel: (count: number) => string;
}) {
  return (
    <section class={s.matchupCard}>
      <h2 class={s.sectionTitle}>{props.title}</h2>
      <Key each={props.rows} by={(row) => row.championId}>
        {(row) => (
          <div class={s.matchupRow}>
            <LazyImage
              src={championIconUrl(row().championId)}
              alt=""
              className={s.smallPortrait}
            />
            <span class={s.championName}>
              {props.championName(row().championId)}
            </span>
            <span>
              <span class={cx(s.rate, rateClass(row().winRate))}>
                {formatRate(row().winRate)}
              </span>
              <span class={s.muted}> {props.gamesLabel(row().play)}</span>
            </span>
          </div>
        )}
      </Key>
    </section>
  );
}
