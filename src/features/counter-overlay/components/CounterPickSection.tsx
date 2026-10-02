/** @jsxImportSource solid-js */
import { Key } from "@solid-primitives/keyed";
import { createSignal, Match, Switch } from "solid-js";
import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import { LazyImage } from "@/components/LazyImage";
import { championIconUrl } from "@/features/opgg/assets";
import { CHAMPION_POSITIONS, formatRate } from "@/features/opgg/model";
import { useSolidTranslation } from "@/i18n/solid";
import { useCounterDetail } from "../hooks/use-counter-detail";
import { counterSectionState, counterWinRate } from "../model";
import * as s from "./CounterPickSection.css.ts";

export function CounterPickSection(props: {
  pick: EnemyChampionPick;
  nameOf: (championId: number) => string;
}) {
  const { t } = useSolidTranslation();
  const detailQuery = useCounterDetail(() => props.pick);
  const [expanded, setExpanded] = createSignal(true);
  const counters = () => detailQuery.data()?.weakAgainst ?? [];
  const state = () =>
    counterSectionState({
      expanded: expanded(),
      loading: detailQuery.isLoading() && !detailQuery.data(),
      failed: Boolean(detailQuery.error()),
      counterCount: counters().length,
    });
  const lane = () => {
    const position = props.pick.position;
    if (
      CHAMPION_POSITIONS.includes(
        position as (typeof CHAMPION_POSITIONS)[number],
      )
    ) {
      return t(`counterOverlay.positions.${position}`);
    }
    return t("counterOverlay.unknownPosition");
  };

  return (
    <article class={s.section}>
      <div class={s.enemy}>
        <LazyImage
          src={championIconUrl(props.pick.championId)}
          alt=""
          className={s.portrait}
        />
        <div>
          <h2 class={s.enemyName}>{props.nameOf(props.pick.championId)}</h2>
          <p class={s.muted}>
            {lane()}
            {detailQuery.data()
              ? ` · ${t("counterOverlay.winRate", {
                  rate: formatRate(detailQuery.data()?.winRate ?? 0),
                })}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          class={s.toggle}
          aria-label={
            expanded()
              ? "Collapse champion counters"
              : "Expand champion counters"
          }
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded()
            ? t("counterOverlay.collapse")
            : t("counterOverlay.expand")}
        </button>
      </div>
      <Switch>
        <Match when={state() === "loading"}>
          <p class={s.status}>{t("counterOverlay.loading")}</p>
        </Match>
        <Match when={state() === "failed"}>
          <p class={s.status}>{t("counterOverlay.loadFailed")}</p>
        </Match>
        <Match when={state() === "empty"}>
          <p class={s.status}>{t("counterOverlay.insufficient")}</p>
        </Match>
        <Match when={state() === "ready"}>
          <Key each={counters()} by={(row) => row.championId}>
            {(row) => {
              const rate = () => counterWinRate(row().winRate);
              return (
                <div class={s.row}>
                  <LazyImage
                    src={championIconUrl(row().championId)}
                    alt=""
                    className={s.smallPortrait}
                  />
                  <span class={s.name}>{props.nameOf(row().championId)}</span>
                  <span>
                    <span
                      class={`${s.rate} ${rate() >= 0.5 ? s.rateTone.win : s.rateTone.loss}`}
                    >
                      {formatRate(rate())}
                    </span>
                    <span class={s.muted}>
                      {" "}
                      {t("counterOverlay.games", { count: String(row().play) })}
                    </span>
                  </span>
                </div>
              );
            }}
          </Key>
        </Match>
      </Switch>
    </article>
  );
}
