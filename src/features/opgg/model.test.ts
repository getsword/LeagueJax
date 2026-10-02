import { describe, expect, test } from "bun:test";
import type {
  OpggChampionSummaryDto,
  OpggPositionSummaryDto,
} from "@/bindings/opgg";
import {
  filterChampions,
  formatRate,
  matchesChampionQuery,
  preferredPosition,
} from "./model";

function position(
  name: string,
  roleRate: number,
  winRate = 0.5,
): OpggPositionSummaryDto {
  return {
    position: name,
    roleRate,
    winRate,
    pickRate: 0.1,
  };
}

function champion(
  id: number,
  winRate: number,
  positions: OpggPositionSummaryDto[],
): OpggChampionSummaryDto {
  return {
    id,
    winRate,
    pickRate: 0.1,
    banRate: 0.1,
    tier: 1,
    positions,
  };
}

describe("champion opgg view model", () => {
  test("formats OP.GG ratios as percentages", () => {
    expect(formatRate(0.507786)).toBe("50.8%");
  });

  test("prefers the lane this champion is actually played in", () => {
    expect(
      preferredPosition([
        position("MID", 0.2),
        position("TOP", 0.7),
        position("JUNGLE", 0.1),
      ]),
    ).toBe("TOP");
  });

  test("filters by lane and sorts that lane's win rate", () => {
    const rows = [
      champion(1, 0.6, [position("TOP", 0.8, 0.48)]),
      champion(2, 0.4, [position("MID", 0.9, 0.55)]),
      champion(3, 0.7, [
        position("TOP", 0.4, 0.62),
        position("MID", 0.5, 0.51),
      ]),
    ];

    expect(
      filterChampions(rows, "", "TOP", () => "").map((row) => row.id),
    ).toEqual([3, 1]);
    expect(
      filterChampions(rows, "", null, () => "").map((row) => row.id),
    ).toEqual([1, 2, 3]);
  });

  test("matches champion names and ids", () => {
    expect(matchesChampionQuery("盖伦", 86, "盖")).toBe(true);
    expect(matchesChampionQuery("Garen", 86, "86")).toBe(true);
    expect(matchesChampionQuery("Garen", 86, "ahri")).toBe(false);
  });
});
