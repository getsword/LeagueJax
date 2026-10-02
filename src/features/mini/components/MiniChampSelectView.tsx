/** @jsxImportSource solid-js */
import { keyArray } from "@solid-primitives/keyed";
import { CircleCheck } from "lucide-solid";
import { createMemo, Show } from "solid-js";
import { ChampionAvatar } from "@/components/champion-avatar/ChampionAvatar";
import { useSolidTranslation } from "@/i18n/solid";
import { useSolidChampSelectPickableChampionIds } from "../hooks/use-champ-select-pickable-champion-ids";
import type { MiniChampSelectActions } from "../hooks/use-mini-champ-select-actions";
import type { MiniWindowModel } from "../hooks/use-mini-window-model";
import * as s from "./MiniChampSelectView.css";

type ChampSelectModel = NonNullable<MiniWindowModel["champSelect"]>;

function ChampionIcon(props: {
  championId: number | null;
  selected?: boolean;
}) {
  return (
    <ChampionAvatar
      championId={props.championId}
      imageClassName={
        props.selected ? s.selectedChampionImage : s.benchChampionImage
      }
      fallbackClassName={
        props.selected ? s.selectedChampionFallback : s.benchChampionFallback
      }
      alt={props.championId ? `Champion ${props.championId}` : ""}
    />
  );
}

function SelectedChampion(props: { championId: number | null; label: string }) {
  return (
    <div class={s.selectedColumn}>
      <ChampionIcon championId={props.championId} selected />
      <div class={s.selectedLabel}>
        <span>{props.label}</span>
      </div>
    </div>
  );
}

function BenchChampionPool(props: {
  champSelect: ChampSelectModel;
  pickableChampionIds: number[] | null;
  pendingChampionId: number | null;
  onSwap: (championId: number) => void;
}) {
  const benchButtons = keyArray(
    () => props.champSelect.benchChampions,
    (champion) => String(champion.championId),
    (champion) => {
      const isCurrent = createMemo(
        () => champion().championId === props.champSelect.selectedChampionId,
      );
      const isPending = createMemo(
        () => champion().championId === props.pendingChampionId,
      );
      const isPickable = createMemo(
        () =>
          props.pickableChampionIds === null ||
          props.pickableChampionIds.includes(champion().championId),
      );
      const isUnavailable = createMemo(() => !isCurrent() && !isPickable());

      return (
        <button
          type="button"
          aria-label={`Select champion ${champion().championId}`}
          class={s.benchChampionButton}
          data-current={isCurrent() ? "true" : undefined}
          data-pending={isPending() ? "true" : undefined}
          data-unpickable={isUnavailable() ? "true" : undefined}
          disabled={isPending() || isCurrent() || !isPickable()}
          onClick={() => props.onSwap(champion().championId)}
        >
          <ChampionIcon championId={champion().championId} />
        </button>
      );
    },
  );

  return <div class={s.benchGrid}>{benchButtons()}</div>;
}

function ChampSelectStatus(props: {
  champSelect: ChampSelectModel;
  queueName: string | null;
}) {
  const { t } = useSolidTranslation();
  const title = createMemo(() =>
    props.champSelect.selectedChampionId
      ? t("mini.champSelect.status.completed")
      : t("mini.champSelect.status.pending"),
  );
  const meta = createMemo(
    () =>
      props.queueName ??
      t("mini.queue.unknown", { queueId: props.champSelect.queueId ?? "" }),
  );

  return (
    <section class={s.statusPanel}>
      <div class={s.phaseDot} aria-hidden="true" />
      <div class={s.statusText}>
        <div class={s.statusTitle}>{title()}</div>
        <div class={s.statusMeta}>{meta()}</div>
      </div>
    </section>
  );
}

export function MiniChampSelectView(props: {
  model: MiniWindowModel;
  actions: MiniChampSelectActions;
  active: boolean;
}) {
  const { t } = useSolidTranslation();
  const champSelect = createMemo(() => props.model.champSelect);
  const { data: pickableChampionIds, error: pickableError } =
    useSolidChampSelectPickableChampionIds(
      () =>
        props.active && champSelect()?.mode === "bench"
          ? (champSelect()?.session.gameId ?? null)
          : null,
      () => champSelect()?.session.counter ?? null,
    );
  const selectedLabel = createMemo(() =>
    champSelect()?.selectedChampionId
      ? t("mini.champSelect.selected")
      : t("mini.champSelect.notSelected"),
  );

  return (
    <Show when={champSelect()}>
      {(currentChampSelect) => (
        <section class={s.root}>
          <Show
            when={currentChampSelect().mode === "bench"}
            fallback={
              <section class={s.defaultPanel}>
                <ChampionIcon
                  championId={currentChampSelect().selectedChampionId}
                  selected
                />
                <div class={s.selectedLabel}>
                  <CircleCheck size={14} aria-hidden="true" />
                  <span>{selectedLabel()}</span>
                </div>
              </section>
            }
          >
            <section class={s.benchPanel}>
              <SelectedChampion
                championId={currentChampSelect().selectedChampionId}
                label={selectedLabel()}
              />
              <BenchChampionPool
                champSelect={currentChampSelect()}
                pickableChampionIds={
                  pickableError() ? null : (pickableChampionIds() ?? null)
                }
                pendingChampionId={props.actions.pendingChampionId()}
                onSwap={props.actions.swap}
              />
            </section>
          </Show>

          <ChampSelectStatus
            champSelect={currentChampSelect()}
            queueName={props.model.queueName}
          />
        </section>
      )}
    </Show>
  );
}
