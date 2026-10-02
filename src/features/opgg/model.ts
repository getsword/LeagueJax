import type {
  OpggChampionSummaryDto,
  OpggPositionSummaryDto,
} from "@/bindings/opgg";

export const CHAMPION_POSITIONS = [
  "TOP",
  "JUNGLE",
  "MID",
  "ADC",
  "SUPPORT",
] as const;

const POSITIONS = CHAMPION_POSITIONS;

export function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) {
    return "0.0%";
  }
  return `${(rate * 100).toFixed(1)}%`;
}

export function preferredPosition(positions: OpggPositionSummaryDto[]): string {
  const ranked = positions
    .filter((position) =>
      POSITIONS.includes(position.position as (typeof POSITIONS)[number]),
    )
    .sort(
      (left, right) =>
        right.roleRate - left.roleRate || right.winRate - left.winRate,
    );
  return ranked[0]?.position ?? "MID";
}

export function laneStats(
  positions: OpggPositionSummaryDto[],
  lane: string,
): OpggPositionSummaryDto | undefined {
  return positions.find((position) => position.position === lane);
}

export function filterChampions(
  champions: OpggChampionSummaryDto[],
  query: string,
  lane: string | null,
  nameOf: (championId: number) => string,
): OpggChampionSummaryDto[] {
  const matched = champions.filter((champion) => {
    const playsLane =
      !lane ||
      champion.positions.some((position) => position.position === lane);
    return (
      playsLane && matchesChampionQuery(nameOf(champion.id), champion.id, query)
    );
  });
  if (!lane) {
    return matched;
  }
  return matched.slice().sort((left, right) => {
    const leftRate = laneStats(left.positions, lane)?.winRate ?? 0;
    const rightRate = laneStats(right.positions, lane)?.winRate ?? 0;
    return rightRate - leftRate || left.id - right.id;
  });
}

export function matchesChampionQuery(
  name: string,
  championId: number,
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return (
    name.toLowerCase().includes(normalized) ||
    championId.toString().includes(normalized)
  );
}
