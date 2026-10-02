import type { OpggChampionDetailDto } from "@/bindings/opgg";

const MAX_CHAMPION_LEVEL = 18;
const OPGG_REPORTED_LEVELS = 15;

// Caps count manually allocated points, not free ranks. Jayce and Aphelios do
// not spend points on R; Udyr has four basic abilities. Transform champions
// such as Elise still spend three points on R despite its free initial rank.
// Verified against Riot's 16.19.1 Data Dragon and Aphelios Kit Primer.
function skillPointCaps(championId: number): Readonly<Record<string, number>> {
  switch (championId) {
    case 77: // Udyr
      return { Q: 6, W: 6, E: 6, R: 6 };
    case 126: // Jayce
    case 523: // Aphelios (Q/W/E represent stat upgrades)
      return { Q: 6, W: 6, E: 6, R: 0 };
    default:
      return { Q: 5, W: 5, E: 5, R: 3 };
  }
}

// Reject ambiguous source data rather than inferring more ranks from an
// unknown skill, an exceeded cap, or an automatically granted R entry.
function allocatedRanks(
  order: readonly string[],
  caps: Readonly<Record<string, number>>,
): Map<string, number> | null {
  const ranks = new Map(Object.keys(caps).map((skill) => [skill, 0]));
  for (const skill of order) {
    const rank = ranks.get(skill);
    if (rank === undefined || rank >= caps[skill]) {
      return null;
    }
    ranks.set(skill, rank + 1);
  }
  return ranks;
}

// Only extend OP.GG's late-game tail: by level 16 every paid rank is unlocked.
// Earlier gaps cannot be reconstructed reliably from max priority alone.
// Preserve reported choices, and use null for levels we cannot infer safely.
export function resolveSkillOrder(
  detail: Pick<OpggChampionDetailDto, "id" | "skillOrder" | "skillPriority">,
): Array<string | null> {
  const reported = detail.skillOrder.slice(0, MAX_CHAMPION_LEVEL);
  const order = Array.from(
    { length: MAX_CHAMPION_LEVEL },
    (_, index) => reported[index] ?? null,
  );
  if (
    reported.length < OPGG_REPORTED_LEVELS ||
    reported.length === MAX_CHAMPION_LEVEL
  ) {
    return order;
  }

  const caps = skillPointCaps(detail.id);
  const ranks = allocatedRanks(reported, caps);
  if (!ranks) {
    return order;
  }

  const priority =
    caps.R === 3 ? ["R", ...detail.skillPriority] : detail.skillPriority;
  const learnableSkills = Object.keys(caps).filter((skill) => caps[skill] > 0);
  if (
    priority.length !== learnableSkills.length ||
    new Set(priority).size !== priority.length ||
    priority.some((skill) => !learnableSkills.includes(skill))
  ) {
    return order;
  }

  for (let index = reported.length; index < MAX_CHAMPION_LEVEL; index += 1) {
    const skill = priority.find(
      (candidate) => (ranks.get(candidate) ?? 0) < caps[candidate],
    );
    if (!skill) {
      break;
    }
    order[index] = skill;
    ranks.set(skill, (ranks.get(skill) ?? 0) + 1);
  }
  return order;
}
