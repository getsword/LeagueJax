import { invoke } from "@tauri-apps/api/core";
import type { Accessor } from "solid-js";
import type { EnemyChampionPick } from "@/bindings/ongoing_game";
import type {
  OpggChampionDetailDto,
  OpggChampionListDto,
} from "@/bindings/opgg";
import { preferredPosition } from "@/features/opgg/model";
import { createSolidQuery } from "@/infra/solid-query";

async function loadCounterDetail(
  championId: number,
  position: string,
): Promise<OpggChampionDetailDto> {
  let lane = position;
  if (!lane) {
    const list = await invoke<OpggChampionListDto>("opgg_list_champions");
    const champion = list.champions.find((entry) => entry.id === championId);
    lane = champion ? preferredPosition(champion.positions) : "MID";
  }
  return invoke<OpggChampionDetailDto>("opgg_get_champion_detail", {
    championId,
    position: lane,
  });
}

export function useCounterDetail(pick: Accessor<EnemyChampionPick>) {
  return createSolidQuery<OpggChampionDetailDto>(
    () =>
      [
        "counter-overlay",
        pick().cellId,
        pick().championId,
        pick().position,
      ] as const,
    (key) => {
      const [, , championId, position] = key as readonly [
        string,
        number,
        number,
        string,
      ];
      return loadCounterDetail(championId, position);
    },
  );
}
