import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import type { CounterPositionChoice } from "./model";

export interface CounterCardState {
  championId: number;
  expanded: boolean;
  position: CounterPositionChoice;
}

export interface CounterPanelState {
  defaultExpanded: boolean;
  cards: Record<number, CounterCardState>;
}

export function createCounterPanelState(): CounterPanelState {
  return { defaultExpanded: true, cards: {} };
}

// State follows a cell/champion pair, not a changing LCU object reference.
// Replacements reset overrides, and new locks inherit the latest bulk choice.
export function reconcileCounterPanelState(
  state: CounterPanelState,
  picks: readonly EnemyChampionPick[],
): CounterPanelState {
  let changed = Object.keys(state.cards).length !== picks.length;
  const cards: CounterPanelState["cards"] = {};
  for (const pick of picks) {
    const previous = state.cards[pick.cellId];
    if (previous?.championId === pick.championId) {
      cards[pick.cellId] = previous;
    } else {
      changed = true;
      cards[pick.cellId] = {
        championId: pick.championId,
        expanded: state.defaultExpanded,
        position: "auto",
      };
    }
  }
  return changed ? { ...state, cards } : state;
}

export function setAllCounterCardsExpanded(
  state: CounterPanelState,
  expanded: boolean,
): CounterPanelState {
  return {
    defaultExpanded: expanded,
    cards: Object.fromEntries(
      Object.entries(state.cards).map(([id, card]) => [
        id,
        { ...card, expanded },
      ]),
    ),
  };
}

export function setCounterCardExpanded(
  state: CounterPanelState,
  cellId: number,
  expanded: boolean,
): CounterPanelState {
  const card = state.cards[cellId];
  return card
    ? { ...state, cards: { ...state.cards, [cellId]: { ...card, expanded } } }
    : state;
}

// Selecting a lane is an explicit request to inspect that matchup, so open
// the card even if it was collapsed and preserve the choice through updates.
export function setCounterCardPosition(
  state: CounterPanelState,
  cellId: number,
  position: CounterPositionChoice,
): CounterPanelState {
  const card = state.cards[cellId];
  return card
    ? {
        ...state,
        cards: {
          ...state.cards,
          [cellId]: { ...card, position, expanded: true },
        },
      }
    : state;
}
