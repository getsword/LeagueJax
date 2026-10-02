import { describe, expect, test } from "bun:test";
import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import type { OpggChampionSummaryDto } from "@/bindings/opgg";
import {
  counterSectionState,
  counterWinRate,
  mergeLockedPicks,
  resolveCounterPosition,
} from "./model";

function pick(cellId: number, championId: number): EnemyChampionPick {
  return { cellId, championId, position: "TOP" };
}

describe("champion counters", () => {
  test("manual lanes take precedence over client data and do not need role statistics", () => {
    expect(resolveCounterPosition(pick(5, 84), undefined, "JUNGLE")).toBe(
      "JUNGLE",
    );
    expect(
      resolveCounterPosition(
        { ...pick(5, 84), position: "" },
        undefined,
        "SUPPORT",
      ),
    ).toBe("SUPPORT");
    expect(resolveCounterPosition(pick(5, 84), undefined, "auto")).toBe("TOP");
  });
  test("keeps known lanes and does not invent a lane before statistics arrive", () => {
    expect(resolveCounterPosition(pick(5, 86), undefined)).toBe("TOP");
    expect(
      resolveCounterPosition({ ...pick(5, 86), position: "" }, undefined),
    ).toBeNull();
    expect(
      resolveCounterPosition({ ...pick(5, 86), position: "UNKNOWN" }, []),
    ).toBeNull();
  });

  test("infers a missing lane from the champion's role frequency", () => {
    const champions: OpggChampionSummaryDto[] = [
      {
        id: 86,
        tier: 1,
        winRate: 0.52,
        pickRate: 0.1,
        banRate: 0.01,
        positions: [
          { position: "MID", roleRate: 0.1, winRate: 0.6, pickRate: 0.01 },
          { position: "TOP", roleRate: 0.9, winRate: 0.51, pickRate: 0.1 },
        ],
      },
    ];
    expect(
      resolveCounterPosition({ ...pick(5, 86), position: "" }, champions),
    ).toBe("TOP");
    expect(
      resolveCounterPosition({ ...pick(5, 122), position: "" }, champions),
    ).toBeNull();
  });

  test("updates traded champions and removes cleared enemy slots", () => {
    expect(
      mergeLockedPicks([pick(4, 86), pick(5, 122)], [pick(4, 222)]),
    ).toEqual([pick(4, 222)]);
    expect(mergeLockedPicks([pick(4, 86)], [])).toEqual([]);
  });

  test("represents request errors and empty results without stale ready state", () => {
    expect(
      counterSectionState({
        expanded: true,
        loading: false,
        failed: true,
        counterCount: 8,
      }),
    ).toBe("failed");
    expect(
      counterSectionState({
        expanded: true,
        loading: false,
        failed: false,
        counterCount: 0,
      }),
    ).toBe("empty");
  });
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

  test("appends newly locked champions after the ones already shown", () => {
    expect(
      mergeLockedPicks([pick(4, 86)], [pick(5, 122), pick(4, 86)]).map(
        (entry) => entry.cellId,
      ),
    ).toEqual([4, 5]);
  });
});
