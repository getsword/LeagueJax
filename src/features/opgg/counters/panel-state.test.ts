import { describe, expect, test } from "bun:test";
import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import {
  createCounterPanelState,
  reconcileCounterPanelState,
  setAllCounterCardsExpanded,
  setCounterCardExpanded,
  setCounterCardPosition,
} from "./panel-state";

const picks: EnemyChampionPick[] = [
  { cellId: 5, championId: 84, position: "" },
  { cellId: 6, championId: 111, position: "SUPPORT" },
];
const initial = () =>
  reconcileCounterPanelState(createCounterPanelState(), picks);

describe("counter panel controls", () => {
  test("starts expanded and preserves state across repeated LCU updates", () => {
    const state = initial();
    expect(
      Object.values(state.cards).every(
        (card) => card.expanded && card.position === "auto",
      ),
    ).toBe(true);
    expect(
      reconcileCounterPanelState(
        state,
        picks.map((pick) => ({ ...pick })),
      ),
    ).toBe(state);
  });

  test("bulk changes cover all cards and establish the default for later locks", () => {
    const collapsed = setAllCounterCardsExpanded(initial(), false);
    const updated = reconcileCounterPanelState(collapsed, [
      ...picks,
      { cellId: 7, championId: 19, position: "JUNGLE" },
    ]);
    expect(Object.values(updated.cards).every((card) => !card.expanded)).toBe(
      true,
    );
    const expanded = setAllCounterCardsExpanded(updated, true);
    expect(Object.values(expanded.cards).every((card) => card.expanded)).toBe(
      true,
    );
    expect(expanded.defaultExpanded).toBe(true);
    expect(Object.values(collapsed.cards).every((card) => !card.expanded)).toBe(
      true,
    );
  });

  test("individual expansion changes only that card, not the bulk default", () => {
    const collapsed = setAllCounterCardsExpanded(initial(), false);
    const state = setCounterCardExpanded(collapsed, 5, true);
    expect(state.cards[5]?.expanded).toBe(true);
    expect(state.cards[6]?.expanded).toBe(false);
    expect(state.defaultExpanded).toBe(false);
  });

  test("manual lane selection opens only its card and survives bulk toggles", () => {
    const collapsed = setAllCounterCardsExpanded(initial(), false);
    const selected = setCounterCardPosition(collapsed, 5, "TOP");
    expect(selected.cards[5]).toEqual({
      championId: 84,
      position: "TOP",
      expanded: true,
    });
    expect(selected.cards[6]).toEqual(collapsed.cards[6]);
    expect(setAllCounterCardsExpanded(selected, false).cards[5]?.position).toBe(
      "TOP",
    );
    expect(setAllCounterCardsExpanded(selected, true).cards[5]?.position).toBe(
      "TOP",
    );
    expect(setCounterCardPosition(selected, 5, "auto").cards[5]?.position).toBe(
      "auto",
    );
  });

  test("LCU lane updates do not overwrite a manual choice", () => {
    const selected = setCounterCardPosition(initial(), 5, "TOP");
    const updated = reconcileCounterPanelState(
      selected,
      picks.map((pick) => ({ ...pick, position: "JUNGLE" })),
    );
    expect(updated.cards[5]?.position).toBe("TOP");
  });

  test("a champion replacement resets its override and follows the bulk default", () => {
    let state = setCounterCardPosition(initial(), 5, "TOP");
    state = setAllCounterCardsExpanded(state, false);
    state = reconcileCounterPanelState(
      state,
      picks.map((pick) =>
        pick.cellId === 5 ? { ...pick, championId: 222 } : pick,
      ),
    );
    expect(state.cards[5]).toEqual({
      championId: 222,
      position: "auto",
      expanded: false,
    });
    expect(state.cards[6]?.expanded).toBe(false);
  });

  test("removed locks and a new session do not inherit obsolete choices", () => {
    const selected = setCounterCardPosition(initial(), 5, "TOP");
    const cleared = reconcileCounterPanelState(selected, []);
    expect(cleared.cards).toEqual({});
    expect(reconcileCounterPanelState(cleared, picks).cards[5]?.position).toBe(
      "auto",
    );
    expect(initial().cards[5]).toEqual({
      championId: 84,
      position: "auto",
      expanded: true,
    });
  });

  test("callbacks from removed cards cannot create orphan state", () => {
    const empty = createCounterPanelState();
    expect(setCounterCardExpanded(empty, 5, false)).toBe(empty);
    expect(setCounterCardPosition(empty, 5, "TOP")).toBe(empty);
  });
});
