import type { OpggFiltersDto, OpggRankTier, OpggRegion } from "@/bindings/opgg";

export const DEFAULT_CHAMPION_FILTERS: Readonly<OpggFiltersDto> = {
  region: "global",
  tier: "emerald_plus",
};

export const OPGG_REGIONS = [
  "global",
  "na",
  "me",
  "euw",
  "eune",
  "oce",
  "kr",
  "jp",
  "br",
  "las",
  "lan",
  "ru",
  "tr",
  "sea",
  "tw",
  "vn",
] as const satisfies readonly OpggRegion[];

export const OPGG_RANK_TIERS = [
  "all",
  "challenger",
  "grandmaster",
  "master_plus",
  "master",
  "diamond_plus",
  "diamond",
  "emerald_plus",
  "emerald",
  "platinum_plus",
  "platinum",
  "gold_plus",
  "gold",
  "silver",
  "bronze",
  "iron",
] as const satisfies readonly OpggRankTier[];

export function isOpggRegion(value: string | undefined): value is OpggRegion {
  return OPGG_REGIONS.some((region) => region === value);
}

export function isOpggRankTier(
  value: string | undefined,
): value is OpggRankTier {
  return OPGG_RANK_TIERS.some((tier) => tier === value);
}

export function matchesChampionFilters(
  actual: OpggFiltersDto | undefined,
  expected: OpggFiltersDto,
): boolean {
  return actual?.region === expected.region && actual.tier === expected.tier;
}
