import { afterEach, describe, expect, test } from "bun:test";
import type { OngoingGameUpdated } from "@/bindings/ongoing_game";
import { ongoingGameStore } from "@/features/ongoing-game/store-core";
import { createMiniOngoingUpdateGate } from "./ongoing-update-gate";

function snapshot(
  phase: OngoingGameUpdated["phase"],
  championId = 86,
): OngoingGameUpdated {
  return {
    phase,
    lifecycle_game_id: null,
    team_members: [],
    match_history_tag: null,
    match_histories_pending: false,
    effective_queue_id: null,
    effective_mode_tag: null,
    gameflow_session: null,
    matchmaking_search: null,
    ready_check: null,
    champ_select_session: null,
    summoner_states: [],
    history_states: [],
    enemy_champion_picks: [{ cellId: 5, championId, position: "TOP" }],
  };
}

afterEach(() => ongoingGameStore.getState().reset());

describe("mini ongoing game updates", () => {
  test("applies an opening snapshot when no event has arrived", () => {
    const gate = createMiniOngoingUpdateGate((value) =>
      ongoingGameStore.getState().applyUpdated(value),
    );
    gate.receive(snapshot("ChampSelect"), "snapshot");
    expect(ongoingGameStore.getState().enemyChampionPicks[0]?.championId).toBe(
      86,
    );
  });

  test("rejects a late snapshot even before a live event is rendered", () => {
    const pending: OngoingGameUpdated[] = [];
    const gate = createMiniOngoingUpdateGate((value) => pending.push(value));
    gate.receive(snapshot("ChampSelect", 122), "event");
    gate.receive(snapshot("Idle"), "snapshot");
    expect(pending).toHaveLength(1);
    expect(pending[0]?.enemy_champion_picks[0]?.championId).toBe(122);
  });

  test("clears enemy picks on phase exit and after disconnect", () => {
    const gate = createMiniOngoingUpdateGate((value) =>
      ongoingGameStore.getState().applyUpdated(value),
    );
    gate.receive(snapshot("ChampSelect"), "event");
    gate.receive(snapshot("InGame"), "event");
    expect(ongoingGameStore.getState().enemyChampionPicks).toEqual([]);
    gate.receive(snapshot("ChampSelect", 122), "event");
    expect(ongoingGameStore.getState().enemyChampionPicks[0]?.championId).toBe(
      122,
    );
    gate.receive(snapshot("Idle"), "event");
    expect(ongoingGameStore.getState().enemyChampionPicks).toEqual([]);
  });

  test("ignores pending callbacks after teardown", () => {
    const updates: OngoingGameUpdated[] = [];
    const gate = createMiniOngoingUpdateGate((value) => updates.push(value));
    gate.dispose();
    gate.receive(snapshot("ChampSelect"), "event");
    gate.receive(snapshot("Idle"), "snapshot");
    expect(updates).toEqual([]);
  });
});
