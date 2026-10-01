import { describe, expect, test } from "bun:test";
import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import {
  counterSectionState,
  counterWinRate,
  mergeLockedPicks,
  nextEnemyPicks,
} from "./model";

function pick(cellId: number, championId: number): EnemyChampionPick {
  return { cellId, championId, position: "TOP" };
}

describe("counter overlay", () => {
  test("turns the enemy win rate into the counter's win rate", () => {
    expect(counterWinRate(0.42)).toBeCloseTo(0.58);
  });

  test("hides counters until the champion section is expanded", () => {
    expect(
      counterSectionState({
        expanded: false,
        loading: true,
        failed: false,
        counterCount: 0,
      }),
    ).toBe("hidden");
    expect(
      counterSectionState({
        expanded: true,
        loading: false,
        failed: false,
        counterCount: 2,
      }),
    ).toBe("ready");
  });

  test("keeps live locks when an older snapshot arrives later", () => {
    const live = nextEnemyPicks({
      current: [],
      incoming: [pick(4, 86)],
      source: "event",
      eventSeen: false,
    });
    const stale = nextEnemyPicks({
      current: live.picks,
      incoming: [],
      source: "snapshot",
      eventSeen: live.eventSeen,
    });

    expect(stale.picks.map((entry) => entry.cellId)).toEqual([4]);
  });

  test("uses the opening snapshot before any live update", () => {
    const snapshot = nextEnemyPicks({
      current: [],
      incoming: [pick(4, 86)],
      source: "snapshot",
      eventSeen: false,
    });

    expect(snapshot.eventSeen).toBe(false);
    expect(snapshot.picks.map((entry) => entry.cellId)).toEqual([4]);
  });

  test("appends newly locked champions after the ones already shown", () => {
    expect(
      mergeLockedPicks([pick(4, 86)], [pick(5, 122), pick(4, 86)]).map(
        (entry) => entry.cellId,
      ),
    ).toEqual([4, 5]);
  });
});
