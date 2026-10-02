/** @jsxImportSource solid-js */
import { invoke } from "@tauri-apps/api/core";
import { createEffect, createMemo, createSignal } from "solid-js";
import type {
  OpggChampionDetailDto,
  OpggChampionListDto,
} from "@/bindings/opgg";
import { useSolidTranslation } from "@/i18n/solid";
import { createSolidQuery } from "@/infra/solid-query";
import { useChampionAssets } from "../assets";
import { ChampionDetail } from "../components/ChampionDetail";
import { ChampionList } from "../components/ChampionList";
import { filterChampions, preferredPosition } from "../model";
import * as s from "./ChampionsRoute.css";

export default function ChampionsRoute() {
  const { t } = useSolidTranslation();
  const assets = useChampionAssets();
  const [query, setQuery] = createSignal("");
  const [laneFilter, setLaneFilter] = createSignal<string | null>(null);
  const [selectedId, setSelectedId] = createSignal<number | null>(null);
  const [position, setPosition] = createSignal<string | null>(null);
  const listQuery = createSolidQuery<OpggChampionListDto>(
    () => "opgg:champions:ranked",
    () => invoke<OpggChampionListDto>("opgg_list_champions"),
  );
  // Solid resources throw when read after a failed request; render the error
  // inside the existing page shell instead of letting that read replace the route.
  const listData = createMemo(() =>
    listQuery.error() ? undefined : listQuery.data(),
  );
  const champions = createMemo(() => listData()?.champions ?? []);
  const championName = (id: number) => assets().names[id] ?? `#${id}`;
  const visibleChampions = createMemo(() =>
    filterChampions(champions(), query(), laneFilter(), championName),
  );
  const selected = createMemo(
    () => champions().find((champion) => champion.id === selectedId()) ?? null,
  );

  createEffect(() => {
    const rows = visibleChampions();
    const current = selectedId();
    if (current !== null && rows.some((champion) => champion.id === current))
      return;
    setSelectedId(rows[0]?.id ?? null);
  });

  createEffect(() => {
    const champion = selected();
    if (!champion) return;
    const current = position();
    if (
      current &&
      champion.positions.some((entry) => entry.position === current)
    )
      return;
    setPosition(preferredPosition(champion.positions));
  });

  createEffect(() => {
    const filter = laneFilter();
    const champion = selected();
    if (!champion || !filter) return;
    if (champion.positions.some((entry) => entry.position === filter))
      setPosition(filter);
  });

  const detailKey = createMemo(() => {
    const id = selectedId();
    const lane = position();
    return id === null || !lane ? null : (["opgg:champion", id, lane] as const);
  });
  const detailQuery = createSolidQuery<OpggChampionDetailDto>(
    detailKey,
    (key) => {
      const [, championId, lane] = key as readonly [string, number, string];
      return invoke<OpggChampionDetailDto>("opgg_get_champion_detail", {
        championId,
        position: lane,
      });
    },
  );
  // A resource can retain the previous result while its key changes. Only show
  // details matching the current selection, so the new portrait never labels old data.
  const detail = createMemo(() => {
    if (detailQuery.error()) return undefined;
    const value = detailQuery.data();
    return value?.id === selectedId() && value?.position === position()
      ? value
      : undefined;
  });
  const listLoading = () => !listQuery.error() && listQuery.isLoading();

  return (
    <div class={s.page}>
      <ChampionList
        champions={visibleChampions()}
        selectedId={selectedId()}
        query={query()}
        lane={laneFilter()}
        loading={listLoading()}
        failed={Boolean(listQuery.error())}
        championName={championName}
        onQuery={setQuery}
        onLane={setLaneFilter}
        onSelect={setSelectedId}
      />
      <ChampionDetail
        champion={selected()}
        name={selected() ? championName(selected()?.id ?? 0) : ""}
        position={position()}
        detail={detail()}
        loading={Boolean(
          listLoading() ||
            (selected() && detailQuery.isValidating() && !detail()),
        )}
        failed={Boolean(
          listQuery.error() || (selected() && detailQuery.error()),
        )}
        failureMessage={t(
          listQuery.error() ? "champions.loadFailed" : "champions.detailFailed",
        )}
        version={listData()?.version ?? ""}
        championName={championName}
        itemIcon={(id) => assets().itemIcons[id] ?? null}
        spellIcon={(id) => assets().spellIcons[id] ?? null}
        onPosition={setPosition}
      />
    </div>
  );
}
