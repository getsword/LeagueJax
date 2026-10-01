import type { EnemyChampionPick } from "@/bindings/ongoing_game";

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

export function nextEnemyPicks(input: {
  current: EnemyChampionPick[];
  incoming: EnemyChampionPick[];
  source: "snapshot" | "event";
  eventSeen: boolean;
}): { picks: EnemyChampionPick[]; eventSeen: boolean } {
  if (input.source === "snapshot" && input.eventSeen) {
    return { picks: input.current, eventSeen: true };
  }
  return {
    picks: mergeLockedPicks(input.current, input.incoming),
    eventSeen: input.eventSeen || input.source === "event",
  };
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
