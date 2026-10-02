import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import type { OpggChampionSummaryDto } from "@/bindings/opgg";
import { CHAMPION_POSITIONS, preferredPosition } from "../model";

export type CounterPositionChoice =
  | "auto"
  | (typeof CHAMPION_POSITIONS)[number];

export function isCounterPosition(
  position: string,
): position is Exclude<CounterPositionChoice, "auto"> {
  return CHAMPION_POSITIONS.some((candidate) => candidate === position);
}

// LCU may omit an opponent's lane. Infer it only from known role statistics;
// a missing champion must not silently become a fabricated mid-lane matchup.
export function resolveCounterPosition(
  pick: EnemyChampionPick,
  champions: readonly OpggChampionSummaryDto[] | undefined,
  choice: CounterPositionChoice = "auto",
): string | null {
  if (choice !== "auto") return choice;
  if (isCounterPosition(pick.position)) return pick.position;
  const positions = champions
    ?.find((champion) => champion.id === pick.championId)
    ?.positions.filter((position) => isCounterPosition(position.position));
  return positions?.length ? preferredPosition(positions) : null;
}

export function counterWinRate(enemyWinRate: number): number {
  if (!Number.isFinite(enemyWinRate)) {
    return 0;
  }
  return Math.min(1, Math.max(0, 1 - enemyWinRate));
}

export type CounterSectionState =
  | "hidden"
  | "loading"
  | "failed"
  | "empty"
  | "ready";

export function counterSectionState(input: {
  expanded: boolean;
  loading: boolean;
  failed: boolean;
  counterCount: number;
}): CounterSectionState {
  if (!input.expanded) {
    return "hidden";
  }
  if (input.loading) {
    return "loading";
  }
  if (input.failed) {
    return "failed";
  }
  if (input.counterCount === 0) {
    return "empty";
  }
  return "ready";
}

export function mergeLockedPicks(
  previous: EnemyChampionPick[],
  next: EnemyChampionPick[],
): EnemyChampionPick[] {
  const incoming = new Map(next.map((pick) => [pick.cellId, pick]));
  const kept = previous.flatMap((pick) => {
    const current = incoming.get(pick.cellId);
    return current ? [current] : [];
  });
  const seen = new Set(kept.map((pick) => pick.cellId));
  return [...kept, ...next.filter((pick) => !seen.has(pick.cellId))];
}
