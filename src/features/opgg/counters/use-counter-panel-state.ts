import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import type { CounterPositionChoice } from "./model";
import {
  createCounterPanelState,
  reconcileCounterPanelState,
  setAllCounterCardsExpanded,
  setCounterCardExpanded,
  setCounterCardPosition,
} from "./panel-state";

// Resolve identity changes synchronously for rendering, then commit them. A
// replacement champion must never issue a request using the old lane override.
export function useCounterPanelState(picks: Accessor<EnemyChampionPick[]>) {
  const [committed, setCommitted] = createSignal(createCounterPanelState());
  const state = createMemo(() =>
    reconcileCounterPanelState(committed(), picks()),
  );
  createEffect(() => setCommitted(state()));
  return {
    card: (pick: EnemyChampionPick) =>
      state().cards[pick.cellId] ?? {
        championId: pick.championId,
        expanded: state().defaultExpanded,
        position: "auto" as const,
      },
    expandAll: (expanded: boolean) =>
      setCommitted(setAllCounterCardsExpanded(state(), expanded)),
    expand: (cellId: number, expanded: boolean) =>
      setCommitted(setCounterCardExpanded(state(), cellId, expanded)),
    selectPosition: (cellId: number, position: CounterPositionChoice) =>
      setCommitted(setCounterCardPosition(state(), cellId, position)),
  };
}
