/** @jsxImportSource solid-js */
import { Key } from "@solid-primitives/keyed";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-solid";
import { createMemo, Show } from "solid-js";
import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import { AppTooltip } from "@/components/AppTooltip";
import * as actionButton from "@/components/IconActionButton.css";
import { ScrollArea } from "@/components/scroll-area";
import { useSolidTranslation } from "@/i18n/solid";
import { useChampionAssets } from "../../assets";
import { DEFAULT_CHAMPION_FILTERS } from "../../filters";
import { useChampionListQuery } from "../../use-champion-queries";
import { isCounterPosition, mergeLockedPicks } from "../model";
import { useCounterPanelState } from "../use-counter-panel-state";
import * as s from "./CounterPanel.css";
import { CounterPickSection } from "./CounterPickSection";

// Keep enemy slots in their arrival order and share one role lookup across all
// opponents whose lanes are unknown. Detail requests remain scoped per champion.
// Include the champion in card identity so swaps also close any open lane picker.
export function CounterPanel(props: {
  picks: EnemyChampionPick[];
  active: boolean;
}) {
  const { t } = useSolidTranslation();
  const assets = useChampionAssets();
  const picks = createMemo<EnemyChampionPick[]>(
    (previous) => mergeLockedPicks(previous, props.picks),
    [],
  );
  const state = useCounterPanelState(picks);
  const hasExpandedCards = createMemo(() =>
    picks().some((pick) => state.card(pick).expanded),
  );
  const list = useChampionListQuery(
    () => DEFAULT_CHAMPION_FILTERS,
    () =>
      props.active &&
      picks().some(
        (pick) =>
          state.card(pick).expanded &&
          state.card(pick).position === "auto" &&
          !isCounterPosition(pick.position),
      ),
  );
  const nameOf = (id: number) => assets().names[id] ?? `#${id}`;
  return (
    <section class={s.root}>
      <div class={s.heading}>
        <div class={s.toolbar}>
          <span>{t("counters.title")}</span>
          <div class={s.actions}>
            <AppTooltip
              content={t(
                hasExpandedCards()
                  ? "counters.collapseAll"
                  : "counters.expandAll",
              )}
              placement="bottom-end"
            >
              {(triggerProps) => (
                <button
                  {...triggerProps({
                    type: "button",
                    class: actionButton.root,
                    "aria-label": hasExpandedCards()
                      ? "Collapse all champion counters"
                      : "Expand all champion counters",
                    disabled: picks().length === 0,
                    onClick: () => state.expandAll(!hasExpandedCards()),
                  })}
                >
                  <Show
                    when={hasExpandedCards()}
                    fallback={<ChevronsUpDown size={16} aria-hidden="true" />}
                  >
                    <ChevronsDownUp size={16} aria-hidden="true" />
                  </Show>
                </button>
              )}
            </AppTooltip>
          </div>
        </div>
        <span class={s.source}>{t("counters.source")}</span>
      </div>
      <ScrollArea
        direction="vertical"
        mode="outset"
        outsetWidth="12px"
        className={s.scroll}
        contentClassName={s.list}
      >
        <Show
          when={picks().length > 0}
          fallback={<p class={s.status}>{t("counters.waiting")}</p>}
        >
          <Key
            each={picks()}
            by={(pick) => `${pick.cellId}:${pick.championId}`}
          >
            {(pick) => (
              <CounterPickSection
                pick={pick()}
                active={props.active}
                expanded={state.card(pick()).expanded}
                positionChoice={state.card(pick()).position}
                onExpandedChange={(expanded) => {
                  state.expand(pick().cellId, expanded);
                }}
                onPositionChange={(position) => {
                  state.selectPosition(pick().cellId, position);
                }}
                nameOf={nameOf}
                championList={list.data()}
                listLoading={list.isLoading()}
                listFailed={Boolean(list.error())}
                retryList={() => {
                  void list.refetch().catch(() => undefined);
                }}
              />
            )}
          </Key>
        </Show>
      </ScrollArea>
    </section>
  );
}
